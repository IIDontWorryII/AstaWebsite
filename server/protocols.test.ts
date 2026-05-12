// server/protocols.test.ts
//
// Tests for GET /api/protocols.
// Like events.test.ts, runs against the dev SQLite DB and asserts on the
// response *shape* and *ordering* rather than specific seeded content,
// so adding/removing seed protocols doesn't break the suite.
//
// One concrete dependency: at least one ASTA and one STUPA protocol must
// exist in the seed for the filter tests to pass. The seed script in
// `prisma/seed.ts` provides both — if you wipe the DB, run `npm run seed`.

import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, prisma } from "./app.js";
import type { ProtocolDTO } from "../shared/types.js";

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/protocols", () => {
  describe("without a filter", () => {
    it("returns 200 with a JSON array", async () => {
      const res = await request(app).get("/api/protocols");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/application\/json/);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("returns at least one protocol (seed data must be present)", async () => {
      const res = await request(app).get("/api/protocols");
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("each protocol has the ProtocolDTO shape with ISO-string dates", async () => {
      const res = await request(app).get("/api/protocols");
      const protocols: ProtocolDTO[] = res.body;

      for (const p of protocols) {
        expect(typeof p.id).toBe("string");
        expect(typeof p.gremium).toBe("string");
        expect(typeof p.title).toBe("string");
        expect(typeof p.fileUrl).toBe("string");
        expect(p.meetingDate).toMatch(ISO_8601);
        expect(p.uploadedAt).toMatch(ISO_8601);
      }
    });

    it("returns protocols sorted by meetingDate descending (newest first)", async () => {
      const res = await request(app).get("/api/protocols");
      const protocols: ProtocolDTO[] = res.body;

      for (let i = 1; i < protocols.length; i++) {
        const prev = new Date(protocols[i - 1].meetingDate).getTime();
        const curr = new Date(protocols[i].meetingDate).getTime();
        expect(curr).toBeLessThanOrEqual(prev);
      }
    });
  });

  describe("with ?gremium= filter", () => {
    it("returns only ASTA protocols when filtered by gremium=ASTA", async () => {
      const res = await request(app).get("/api/protocols?gremium=ASTA");
      const protocols: ProtocolDTO[] = res.body;

      expect(res.status).toBe(200);
      expect(protocols.length).toBeGreaterThan(0);
      for (const p of protocols) {
        expect(p.gremium).toBe("ASTA");
      }
    });

    it("returns only STUPA protocols when filtered by gremium=STUPA", async () => {
      const res = await request(app).get("/api/protocols?gremium=STUPA");
      const protocols: ProtocolDTO[] = res.body;

      expect(res.status).toBe(200);
      expect(protocols.length).toBeGreaterThan(0);
      for (const p of protocols) {
        expect(p.gremium).toBe("STUPA");
      }
    });

    it("returns an empty array for an unknown gremium", async () => {
      const res = await request(app).get("/api/protocols?gremium=NOPE");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });
});
