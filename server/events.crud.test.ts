// server/events.crud.test.ts
//
// Tests for the mutating event routes: POST, PUT, DELETE /api/events.
// (Read tests live in events.test.ts and cover GET /api/events.)
//
// Strategy:
//   - Use supertest.agent() to log in as the seeded admin once and reuse
//     the cookie across all tests.
//   - All created events use the test prefix "test-crud-" in their title.
//     afterAll deletes those rows and any orphan uploaded files so the DB
//     and disk stay clean between runs.
//   - File uploads are sent as in-memory buffers (no fixture files needed).

import { existsSync } from "node:fs";
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, prisma } from "./app.js";
import { EVENTS_UPLOAD_DIR } from "./upload/events.js";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin12345";
const TEST_TITLE_PREFIX = "test-crud-";

// A minimal valid 1x1 transparent PNG. Used to exercise the file-upload
// path without needing a fixture file in the repo.
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

// A tiny bogus file with text/plain mime so we can verify the mime filter.
const PLAIN_TEXT = Buffer.from("not an image");

// One logged-in agent (cookie sticky) reused by all tests.
const editorAgent = request.agent(app);

beforeAll(async () => {
  await editorAgent
    .post("/api/login")
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    .expect(200);
});

afterAll(async () => {
  // Delete the test events we created.
  const rows = await prisma.event.findMany({
    where: { title: { startsWith: TEST_TITLE_PREFIX } },
  });
  await prisma.event.deleteMany({
    where: { title: { startsWith: TEST_TITLE_PREFIX } },
  });
  // Best-effort: also delete any image files those events referenced.
  for (const row of rows) {
    if (!row.imageUrl) continue;
    const file = path.join(EVENTS_UPLOAD_DIR, path.basename(row.imageUrl));
    await unlink(file).catch(() => {});
  }
  await prisma.$disconnect();
});

// Small helper: a fresh title each call so tests don't accidentally collide.
function uniqueTitle(label: string): string {
  return `${TEST_TITLE_PREFIX}${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

describe("POST /api/events", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/events")
      .field("title", uniqueTitle("no-auth"))
      .field("description", "x")
      .field("place", "x")
      .field("startsAt", "2026-12-01T18:00:00.000Z");
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when authenticated as a non-EDITOR", async () => {
    // Create a USER-role account on the fly and reuse its session.
    const userAgent = request.agent(app);
    const email = `test-crud-user-${Date.now()}@example.com`;
    await userAgent
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "Crud User" })
      .expect(200);

    const res = await userAgent
      .post("/api/events")
      .field("title", uniqueTitle("user-role"))
      .field("description", "x")
      .field("place", "x")
      .field("startsAt", "2026-12-01T18:00:00.000Z");
    expect(res.status).toBe(403);

    // Clean up the throwaway user.
    await prisma.user.deleteMany({ where: { email } });
  });

  it("creates an event without an image (happy path)", async () => {
    const title = uniqueTitle("create-no-img");
    const res = await editorAgent
      .post("/api/events")
      .field("title", title)
      .field("description", "Description")
      .field("place", "Campus")
      .field("startsAt", "2026-12-01T18:00:00.000Z");

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title,
      description: "Description",
      place: "Campus",
      startsAt: "2026-12-01T18:00:00.000Z",
      imageUrl: null,
      price: null,
    });
    expect(typeof res.body.id).toBe("string");
  });

  it("creates an event with an image and writes the file to disk", async () => {
    const title = uniqueTitle("create-with-img");
    const res = await editorAgent
      .post("/api/events")
      .field("title", title)
      .field("description", "Description")
      .field("place", "Campus")
      .field("startsAt", "2026-12-01T18:00:00.000Z")
      .attach("image", ONE_PIXEL_PNG, {
        filename: "poster.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.imageUrl).toMatch(/^\/uploads\/events\/[a-f0-9-]+\.png$/);

    // Verify the file actually exists on disk.
    const filename = path.basename(res.body.imageUrl);
    expect(existsSync(path.join(EVENTS_UPLOAD_DIR, filename))).toBe(true);
  });

  it("rejects with 400 on invalid input (missing required fields)", async () => {
    const res = await editorAgent
      .post("/api/events")
      .field("title", uniqueTitle("invalid"));
    // description, place, startsAt all missing → zod fails
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejects with 400 on disallowed mime type", async () => {
    const before = await readdir(EVENTS_UPLOAD_DIR);
    const res = await editorAgent
      .post("/api/events")
      .field("title", uniqueTitle("bad-mime"))
      .field("description", "x")
      .field("place", "x")
      .field("startsAt", "2026-12-01T18:00:00.000Z")
      .attach("image", PLAIN_TEXT, {
        filename: "evil.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    // No new file should have been written.
    const after = await readdir(EVENTS_UPLOAD_DIR);
    expect(after.length).toBe(before.length);
  });
});

describe("PUT /api/events/:id", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app)
      .put("/api/events/some-id")
      .field("title", "x");
    expect(res.status).toBe(401);
  });

  it("returns 404 when the event does not exist", async () => {
    const res = await editorAgent
      .put("/api/events/nope-not-a-real-id")
      .field("title", "Updated");
    expect(res.status).toBe(404);
  });

  it("updates only the fields provided (partial update)", async () => {
    // Create an event first.
    const original = await editorAgent
      .post("/api/events")
      .field("title", uniqueTitle("to-update"))
      .field("description", "Original description")
      .field("place", "Original place")
      .field("startsAt", "2026-12-01T18:00:00.000Z")
      .expect(201);

    // Update only the title.
    const res = await editorAgent
      .put(`/api/events/${original.body.id}`)
      .field("title", `${original.body.title}-edited`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(`${original.body.title}-edited`);
    // Other fields unchanged.
    expect(res.body.description).toBe("Original description");
    expect(res.body.place).toBe("Original place");
  });

  it("replaces the image and deletes the old file when a new image is uploaded", async () => {
    // Create with an image.
    const original = await editorAgent
      .post("/api/events")
      .field("title", uniqueTitle("img-replace"))
      .field("description", "x")
      .field("place", "x")
      .field("startsAt", "2026-12-01T18:00:00.000Z")
      .attach("image", ONE_PIXEL_PNG, {
        filename: "old.png",
        contentType: "image/png",
      })
      .expect(201);

    const oldFilename = path.basename(original.body.imageUrl);
    expect(existsSync(path.join(EVENTS_UPLOAD_DIR, oldFilename))).toBe(true);

    // Update with a new image.
    const res = await editorAgent
      .put(`/api/events/${original.body.id}`)
      .attach("image", ONE_PIXEL_PNG, {
        filename: "new.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).not.toBe(original.body.imageUrl);
    // Old file should be gone, new file should exist.
    expect(existsSync(path.join(EVENTS_UPLOAD_DIR, oldFilename))).toBe(false);
    const newFilename = path.basename(res.body.imageUrl);
    expect(existsSync(path.join(EVENTS_UPLOAD_DIR, newFilename))).toBe(true);
  });
});

describe("DELETE /api/events/:id", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app).delete("/api/events/some-id");
    expect(res.status).toBe(401);
  });

  it("returns 404 when the event does not exist", async () => {
    const res = await editorAgent.delete("/api/events/nope-not-a-real-id");
    expect(res.status).toBe(404);
  });

  it("returns 204 and removes the row plus the image file", async () => {
    const created = await editorAgent
      .post("/api/events")
      .field("title", uniqueTitle("to-delete"))
      .field("description", "x")
      .field("place", "x")
      .field("startsAt", "2026-12-01T18:00:00.000Z")
      .attach("image", ONE_PIXEL_PNG, {
        filename: "doomed.png",
        contentType: "image/png",
      })
      .expect(201);

    const filename = path.basename(created.body.imageUrl);
    expect(existsSync(path.join(EVENTS_UPLOAD_DIR, filename))).toBe(true);

    const res = await editorAgent.delete(`/api/events/${created.body.id}`);
    expect(res.status).toBe(204);

    // Row gone from DB.
    const row = await prisma.event.findUnique({
      where: { id: created.body.id },
    });
    expect(row).toBeNull();

    // File gone from disk.
    expect(existsSync(path.join(EVENTS_UPLOAD_DIR, filename))).toBe(false);
  });
});
