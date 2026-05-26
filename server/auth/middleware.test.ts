// server/auth/middleware.test.ts
//
// Tests for requireAuth and requireEditor via supertest. We attach the
// middlewares to throwaway test routes on a fresh Express app — this is
// cleaner than testing against the real /api/me, because we can test the
// middleware in isolation without depending on the DB or other handlers.
//
// Strategy:
//   - Build a tiny test app with two protected routes:
//       GET /protected-auth      uses requireAuth
//       GET /protected-editor    uses requireEditor
//     Each route handler just echoes req.user so we can verify the
//     middleware attached it correctly.
//   - Sign real JWTs (USER and EDITOR) using the production signToken
//     helper. Send them as cookies with supertest's .set("Cookie", ...).

import cookieParser from "cookie-parser";
import express from "express";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { COOKIE_NAME } from "./cookie.js";
import { requireAuth, requireEditor } from "./middleware.js";
import { signToken } from "./tokens.js";

// Build the test app once — middleware behavior doesn't depend on app state.
const testApp = express();
testApp.use(cookieParser());

testApp.get("/protected-auth", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

testApp.get("/protected-editor", requireEditor, (req, res) => {
  res.json({ user: req.user });
});

// Pre-sign two tokens we'll reuse across tests.
const userToken = signToken({ sub: "user-1", role: "USER" });
const editorToken = signToken({ sub: "editor-1", role: "EDITOR" });

describe("requireAuth", () => {
  it("returns 401 when no cookie is present", async () => {
    const res = await request(testApp).get("/protected-auth");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Not authenticated");
  });

  it("returns 401 when the cookie is malformed", async () => {
    const res = await request(testApp)
      .get("/protected-auth")
      .set("Cookie", `${COOKIE_NAME}=this-is-not-a-real-jwt`);
    expect(res.status).toBe(401);
  });

  it("attaches req.user and calls next() when a valid token is present", async () => {
    const res = await request(testApp)
      .get("/protected-auth")
      .set("Cookie", `${COOKIE_NAME}=${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: "user-1", role: "USER" });
  });

  it("accepts an EDITOR token (requireAuth doesn't care about role)", async () => {
    const res = await request(testApp)
      .get("/protected-auth")
      .set("Cookie", `${COOKIE_NAME}=${editorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("EDITOR");
  });
});

describe("requireEditor", () => {
  it("returns 401 when no cookie is present (no auth at all)", async () => {
    const res = await request(testApp).get("/protected-editor");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Not authenticated");
  });

  it("returns 401 when the cookie is malformed", async () => {
    const res = await request(testApp)
      .get("/protected-editor")
      .set("Cookie", `${COOKIE_NAME}=garbage`);
    expect(res.status).toBe(401);
  });

  it("returns 403 when logged in as USER (right shape, wrong role)", async () => {
    // 403 (not 401) because the user IS authenticated — we just don't
    // let them through this gate. Different message too so the client
    // can show a "you need editor access" UI instead of "please log in".
    const res = await request(testApp)
      .get("/protected-editor")
      .set("Cookie", `${COOKIE_NAME}=${userToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Editor role required");
  });

  it("attaches req.user and calls next() when role is EDITOR", async () => {
    const res = await request(testApp)
      .get("/protected-editor")
      .set("Cookie", `${COOKIE_NAME}=${editorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: "editor-1", role: "EDITOR" });
  });
});
