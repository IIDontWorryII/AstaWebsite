// server/events.crud.test.ts
//
// Tests for the mutating event routes: POST, PUT, DELETE /api/events.
// (Read tests live in events.test.ts and cover GET /api/events.)
//
// Strategy:
//   - vi.mock the upload/storage module so tests never hit Cloudflare R2.
//     The mock's uploadObject / deleteObject are vi.fn() spies we can
//     assert on. publicUrl returns a deterministic test URL.
//   - Use supertest.agent() to log in as the seeded admin once and reuse
//     the cookie across all tests.
//   - All created events use the test prefix "test-crud-" in their title.
//     afterAll deletes those rows so the DB stays tidy.

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

// vi.mock is hoisted to the top of the file, so the spy fns must be
// declared with let bindings that vi.mock's factory can later read.
const mockUpload = vi.fn();
const mockDelete = vi.fn();

vi.mock("./upload/storage.js", () => ({
  uploadObject: (...args: unknown[]) => mockUpload(...args),
  deleteObject: (...args: unknown[]) => mockDelete(...args),
  publicUrl: (key: string) => `https://test-public.r2.dev/${key}`,
  keyFromPublicUrl: (url: string | null) => {
    if (!url) return null;
    const prefix = "https://test-public.r2.dev/";
    if (!url.startsWith(prefix)) return null;
    return url.slice(prefix.length);
  },
}));

// Imports below happen AFTER vi.mock thanks to hoisting.
import { app, prisma } from "./app.js";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin12345";
const TEST_TITLE_PREFIX = "test-crud-";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

const PLAIN_TEXT = Buffer.from("not an image");

const editorAgent = request.agent(app);

beforeAll(async () => {
  await editorAgent
    .post("/api/login")
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    .expect(200);
});

beforeEach(() => {
  // Reset spy state before each test so call-count assertions are scoped.
  // Re-set the default resolved value so storeEventPoster works.
  mockUpload.mockReset().mockResolvedValue(undefined);
  mockDelete.mockReset().mockResolvedValue(undefined);
});

afterAll(async () => {
  await prisma.event.deleteMany({
    where: { title: { startsWith: TEST_TITLE_PREFIX } },
  });
  await prisma.$disconnect();
});

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
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("rejects with 403 when authenticated as a non-EDITOR", async () => {
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
    // No image → no storage interaction.
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("creates an event with an image and uploads it to storage", async () => {
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
    // imageUrl follows the mocked publicUrl shape.
    expect(res.body.imageUrl).toMatch(
      /^https:\/\/test-public\.r2\.dev\/events\/[a-f0-9-]+\.png$/,
    );

    // uploadObject called once with (key, buffer, contentType).
    expect(mockUpload).toHaveBeenCalledTimes(1);
    const [key, buffer, contentType] = mockUpload.mock.calls[0];
    expect(key).toMatch(/^events\/[a-f0-9-]+\.png$/);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(contentType).toBe("image/png");
  });

  it("rejects with 400 on invalid input (missing required fields)", async () => {
    const res = await editorAgent
      .post("/api/events")
      .field("title", uniqueTitle("invalid"));
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    // Validation runs BEFORE storage upload — no storage interaction.
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("rejects with 400 on disallowed mime type", async () => {
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
    // multer rejects in fileFilter before our handler runs.
    expect(mockUpload).not.toHaveBeenCalled();
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
    const original = await editorAgent
      .post("/api/events")
      .field("title", uniqueTitle("to-update"))
      .field("description", "Original description")
      .field("place", "Original place")
      .field("startsAt", "2026-12-01T18:00:00.000Z")
      .expect(201);

    const res = await editorAgent
      .put(`/api/events/${original.body.id}`)
      .field("title", `${original.body.title}-edited`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(`${original.body.title}-edited`);
    expect(res.body.description).toBe("Original description");
    expect(res.body.place).toBe("Original place");
  });

  it("replaces the image and deletes the old object when a new image is uploaded", async () => {
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

    const oldUrl = original.body.imageUrl as string;
    expect(mockUpload).toHaveBeenCalledTimes(1);

    const res = await editorAgent
      .put(`/api/events/${original.body.id}`)
      .attach("image", ONE_PIXEL_PNG, {
        filename: "new.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).not.toBe(oldUrl);
    // One new upload for the replacement.
    expect(mockUpload).toHaveBeenCalledTimes(2);
    // One delete for the old URL.
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith(
      // key extracted from oldUrl by mocked keyFromPublicUrl
      oldUrl.replace("https://test-public.r2.dev/", ""),
    );
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

  it("returns 204, removes the DB row, and deletes the storage object", async () => {
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

    const imageUrl = created.body.imageUrl as string;
    expect(mockUpload).toHaveBeenCalledTimes(1);

    const res = await editorAgent.delete(`/api/events/${created.body.id}`);
    expect(res.status).toBe(204);

    // Row gone from DB.
    const row = await prisma.event.findUnique({
      where: { id: created.body.id },
    });
    expect(row).toBeNull();

    // Storage delete called with the right key.
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith(
      imageUrl.replace("https://test-public.r2.dev/", ""),
    );
  });
});
