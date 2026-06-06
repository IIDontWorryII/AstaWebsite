// server/favorites.test.ts
//
// Tests for the event-favorites (Merkliste) endpoints. Uses the seeded admin
// and a seeded event id. No storage involved, so no R2 mock needed.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, prisma } from "./app.js";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin12345";

const agent = request.agent(app);
// Resolved from the live DB in beforeAll so the test doesn't depend on a
// specific seeded id (events may have been edited via the admin UI).
let TEST_EVENT_ID = "";

beforeAll(async () => {
  await agent
    .post("/api/login")
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    .expect(200);

  const events = await request(app).get("/api/events").expect(200);
  if (events.body.length === 0) {
    throw new Error("No events in DB — run the seed before these tests.");
  }
  TEST_EVENT_ID = events.body[0].id;
});

afterAll(async () => {
  await prisma.favorite.deleteMany({ where: { eventId: TEST_EVENT_ID } });
  await prisma.$disconnect();
});

type IdRow = { id: string };

describe("Event favorites", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/me/favorites");
    expect(res.status).toBe(401);
  });

  it("adds (idempotently), lists, and removes a favorite", async () => {
    await agent.post(`/api/me/favorites/${TEST_EVENT_ID}`).expect(201);

    let list = await agent.get("/api/me/favorites").expect(200);
    expect(list.body.some((e: IdRow) => e.id === TEST_EVENT_ID)).toBe(true);

    // Re-favoriting is a no-op — still exactly one row.
    await agent.post(`/api/me/favorites/${TEST_EVENT_ID}`).expect(201);
    list = await agent.get("/api/me/favorites").expect(200);
    expect(
      list.body.filter((e: IdRow) => e.id === TEST_EVENT_ID).length,
    ).toBe(1);

    await agent.delete(`/api/me/favorites/${TEST_EVENT_ID}`).expect(204);
    list = await agent.get("/api/me/favorites").expect(200);
    expect(list.body.some((e: IdRow) => e.id === TEST_EVENT_ID)).toBe(false);
  });

  it("returns 404 when favoriting a non-existent event", async () => {
    const res = await agent.post("/api/me/favorites/does-not-exist");
    expect(res.status).toBe(404);
  });
});
