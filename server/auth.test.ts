// server/auth.test.ts
//
// Tests for the auth routes: /api/signup, /api/login, /api/logout, /api/me.
//
// Strategy:
//   - Signup tests use unique emails (timestamp-suffixed) so each run can
//     run in any order without colliding with prior runs' rows.
//   - Login tests use the seeded admin (admin@example.com / admin12345).
//     If the seed hasn't been run, run `npm run seed` first.
//   - Cookie persistence across requests uses supertest's `agent` — it
//     auto-stores Set-Cookie headers and resends them on subsequent calls,
//     mimicking a browser.

import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, prisma } from "./app.js";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin12345";

afterAll(async () => {
  // Clean up any users created by signup tests so the DB stays tidy
  // between runs. Matches anything starting with "test-signup-".
  await prisma.user.deleteMany({
    where: { email: { startsWith: "test-signup-" } },
  });
  await prisma.$disconnect();
});

describe("POST /api/signup", () => {
  it("creates a USER-role account and sets an auth cookie", async () => {
    const email = `test-signup-${Date.now()}-a@example.com`;
    const res = await request(app)
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "Tester" });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      email,
      displayName: "Tester",
      role: "USER",
    });

    // The Set-Cookie header should carry an httpOnly auth_token cookie.
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(";") : setCookie;
    expect(cookieStr).toMatch(/auth_token=/);
    expect(cookieStr).toMatch(/HttpOnly/);
  });

  it("rejects missing fields with 400", async () => {
    const res = await request(app)
      .post("/api/signup")
      .send({ email: "nope@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejects passwords shorter than 8 characters with 400", async () => {
    const res = await request(app).post("/api/signup").send({
      email: `test-signup-${Date.now()}-b@example.com`,
      password: "short",
      displayName: "Tester",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8/);
  });

  it("rejects an email without @ with 400", async () => {
    const res = await request(app).post("/api/signup").send({
      email: "no-at-sign",
      password: "password123",
      displayName: "Tester",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it("returns 409 when the email is already registered", async () => {
    const email = `test-signup-${Date.now()}-c@example.com`;
    // First signup succeeds.
    await request(app)
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "First" });

    // Second signup with the same email collides on the unique constraint.
    const res = await request(app)
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "Second" });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already/i);
  });
});

describe("POST /api/login", () => {
  it("logs in the seeded admin with valid credentials", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(ADMIN_EMAIL);
    expect(res.body.user.role).toBe("EDITOR");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("returns 401 with a generic message for a wrong password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: ADMIN_EMAIL, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("returns 401 with the same generic message for an unknown email", async () => {
    // Same error message as "wrong password" so attackers can't probe
    // which emails exist.
    const res = await request(app)
      .post("/api/login")
      .send({ email: "nobody@example.com", password: "any-password" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("returns 400 when email or password is missing", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: ADMIN_EMAIL });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/logout", () => {
  it("clears the auth cookie and returns ok", async () => {
    const res = await request(app).post("/api/logout");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });

    // The clear-cookie Set-Cookie has Expires in the past (Thursday, 1970).
    const setCookie = res.headers["set-cookie"];
    const cookieStr = Array.isArray(setCookie) ? setCookie.join(";") : setCookie;
    expect(cookieStr).toMatch(/auth_token=;/);
  });
});

describe("GET /api/me", () => {
  it("returns the current user when called with a valid auth cookie", async () => {
    // `agent` persists cookies across requests, simulating a browser session.
    const agent = request.agent(app);

    await agent
      .post("/api/login")
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200);

    const res = await agent.get("/api/me");
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(ADMIN_EMAIL);
  });

  it("returns 401 when no cookie is present", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Not authenticated");
  });

  it("returns 401 when the cookie is malformed", async () => {
    const res = await request(app)
      .get("/api/me")
      .set("Cookie", "auth_token=this-is-not-a-real-jwt");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/me", () => {
  it("updates the display name of the logged-in user", async () => {
    const email = `test-signup-patch-${Date.now()}@example.com`;
    const agent = request.agent(app);
    await agent
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "Before" })
      .expect(200);

    const res = await agent.patch("/api/me").field("displayName", "After");
    expect(res.status).toBe(200);
    expect(res.body.user.displayName).toBe("After");
    expect(res.body.user.avatarUrl).toBeNull();
  });

  it("rejects an empty display name with 400", async () => {
    const email = `test-signup-patch-empty-${Date.now()}@example.com`;
    const agent = request.agent(app);
    await agent
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "Name" })
      .expect(200);

    const res = await agent.patch("/api/me").field("displayName", "   ");
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).patch("/api/me").field("displayName", "X");
    expect(res.status).toBe(401);
  });
});
