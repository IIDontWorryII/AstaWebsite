// server/events.test.ts
//
// Tests for GET /api/events. Runs against the dev SQLite DB (the same one
// `npm run seed` populates). Assertions are intentionally seed-agnostic:
// they verify the *shape* and *ordering* of the response rather than
// hard-coded event titles, so adding/removing seed events doesn't break
// the suite.
//
// One concrete dependency on seed data: the suite expects at least 1 event
// to exist. If you see "expected at least one event" failing, run:
//   npm run seed
//
// When we add write routes (POST/PUT/DELETE) we'll need a separate test DB
// so tests can mutate without polluting dev data. For now, all tests are
// read-only, so sharing the dev DB is fine.

import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, prisma } from "./app.js";
import type { EventDTO } from "../shared/types.js";

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

afterAll(async () => {
  // Close the DB connection so vitest can exit cleanly.
  await prisma.$disconnect();
});

describe("GET /api/events", () => {
  it("returns 200 with a JSON array", async () => {
    const res = await request(app).get("/api/events");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns at least one event (seed data must be present)", async () => {
    const res = await request(app).get("/api/events");
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("each event has the EventDTO shape with ISO-string dates", async () => {
    const res = await request(app).get("/api/events");
    const events: EventDTO[] = res.body;

    for (const e of events) {
      expect(typeof e.id).toBe("string");
      expect(typeof e.title).toBe("string");
      expect(typeof e.description).toBe("string");
      expect(typeof e.place).toBe("string");

      // imageUrl/price are nullable
      expect(e.imageUrl === null || typeof e.imageUrl === "string").toBe(true);
      expect(e.price === null || typeof e.price === "string").toBe(true);

      // Date fields must be ISO 8601 strings, not Date objects
      expect(e.startsAt).toMatch(ISO_8601);
      expect(e.createdAt).toMatch(ISO_8601);
      expect(e.updatedAt).toMatch(ISO_8601);
    }
  });

  it("returns events sorted by startsAt ascending", async () => {
    const res = await request(app).get("/api/events");
    const events: EventDTO[] = res.body;

    for (let i = 1; i < events.length; i++) {
      const prev = new Date(events[i - 1].startsAt).getTime();
      const curr = new Date(events[i].startsAt).getTime();
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });
});
