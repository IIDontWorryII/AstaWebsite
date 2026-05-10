// server/health.test.ts
//
// Smoke test: confirms the test infrastructure works and the app
// responds to a basic GET. If this fails, supertest/vitest is broken,
// not the app.

import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("GET /api/health", () => {
  it("returns 200 and the expected payload", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", version: "0.1.0" });
  });
});
