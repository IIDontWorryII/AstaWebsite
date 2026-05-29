// server/protocols.crud.test.ts
//
// Tests for POST, PUT, DELETE /api/protocols. Same mock-the-storage
// strategy as events.crud.test.ts — never hits real R2.

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

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

import { app, prisma } from "./app.js";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin12345";
const TEST_TITLE_PREFIX = "test-crud-";

const MINIMAL_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n" +
    "xref\n0 4\n0000000000 65535 f\n" +
    "trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n0\n%%EOF",
);

const PLAIN_TEXT = Buffer.from("not a pdf");

const editorAgent = request.agent(app);

beforeAll(async () => {
  await editorAgent
    .post("/api/login")
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    .expect(200);
});

beforeEach(() => {
  mockUpload.mockReset().mockResolvedValue(undefined);
  mockDelete.mockReset().mockResolvedValue(undefined);
});

afterAll(async () => {
  await prisma.protocol.deleteMany({
    where: { title: { startsWith: TEST_TITLE_PREFIX } },
  });
  await prisma.$disconnect();
});

function uniqueTitle(label: string): string {
  return `${TEST_TITLE_PREFIX}${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

describe("POST /api/protocols", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/protocols")
      .field("gremium", "ASTA")
      .field("title", uniqueTitle("no-auth"))
      .field("meetingDate", "2026-04-15T18:00:00.000Z")
      .attach("file", MINIMAL_PDF, {
        filename: "p.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(401);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("rejects with 403 when authenticated as USER role", async () => {
    const userAgent = request.agent(app);
    const email = `test-crud-user-${Date.now()}@example.com`;
    await userAgent
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "Crud User" })
      .expect(200);

    const res = await userAgent
      .post("/api/protocols")
      .field("gremium", "ASTA")
      .field("title", uniqueTitle("user-role"))
      .field("meetingDate", "2026-04-15T18:00:00.000Z")
      .attach("file", MINIMAL_PDF, {
        filename: "p.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(403);

    await prisma.user.deleteMany({ where: { email } });
  });

  it("creates a protocol with PDF and uploads it to storage", async () => {
    const title = uniqueTitle("create");
    const res = await editorAgent
      .post("/api/protocols")
      .field("gremium", "ASTA")
      .field("title", title)
      .field("meetingDate", "2026-04-15T18:00:00.000Z")
      .attach("file", MINIMAL_PDF, {
        filename: "p.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      gremium: "ASTA",
      title,
      meetingDate: "2026-04-15T18:00:00.000Z",
    });
    expect(res.body.fileUrl).toMatch(
      /^https:\/\/test-public\.r2\.dev\/protocols\/[a-f0-9-]+\.pdf$/,
    );

    expect(mockUpload).toHaveBeenCalledTimes(1);
    const [key, buffer, contentType] = mockUpload.mock.calls[0];
    expect(key).toMatch(/^protocols\/[a-f0-9-]+\.pdf$/);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(contentType).toBe("application/pdf");
  });

  it("returns 400 when the PDF is missing (file is required)", async () => {
    const res = await editorAgent
      .post("/api/protocols")
      .field("gremium", "ASTA")
      .field("title", uniqueTitle("no-file"))
      .field("meetingDate", "2026-04-15T18:00:00.000Z");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/file is required/i);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("returns 400 when text fields are missing", async () => {
    const res = await editorAgent
      .post("/api/protocols")
      .field("title", uniqueTitle("no-gremium"))
      .attach("file", MINIMAL_PDF, {
        filename: "p.pdf",
        contentType: "application/pdf",
      });
    expect(res.status).toBe(400);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it("returns 400 on disallowed mime type (e.g. text/plain)", async () => {
    const res = await editorAgent
      .post("/api/protocols")
      .field("gremium", "ASTA")
      .field("title", uniqueTitle("bad-mime"))
      .field("meetingDate", "2026-04-15T18:00:00.000Z")
      .attach("file", PLAIN_TEXT, {
        filename: "fake.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(400);
    expect(mockUpload).not.toHaveBeenCalled();
  });
});

describe("PUT /api/protocols/:id", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app)
      .put("/api/protocols/some-id")
      .field("title", "x");
    expect(res.status).toBe(401);
  });

  it("returns 404 when the protocol does not exist", async () => {
    const res = await editorAgent
      .put("/api/protocols/nope-not-a-real-id")
      .field("title", "Updated");
    expect(res.status).toBe(404);
  });

  it("updates only the fields provided (partial update)", async () => {
    const original = await editorAgent
      .post("/api/protocols")
      .field("gremium", "ASTA")
      .field("title", uniqueTitle("to-update"))
      .field("meetingDate", "2026-04-15T18:00:00.000Z")
      .attach("file", MINIMAL_PDF, {
        filename: "p.pdf",
        contentType: "application/pdf",
      })
      .expect(201);

    const res = await editorAgent
      .put(`/api/protocols/${original.body.id}`)
      .field("title", `${original.body.title}-edited`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(`${original.body.title}-edited`);
    expect(res.body.gremium).toBe("ASTA");
  });

  it("replaces the PDF and deletes the old object when a new one is uploaded", async () => {
    const original = await editorAgent
      .post("/api/protocols")
      .field("gremium", "STUPA")
      .field("title", uniqueTitle("file-replace"))
      .field("meetingDate", "2026-04-15T18:00:00.000Z")
      .attach("file", MINIMAL_PDF, {
        filename: "old.pdf",
        contentType: "application/pdf",
      })
      .expect(201);

    const oldUrl = original.body.fileUrl as string;
    expect(mockUpload).toHaveBeenCalledTimes(1);

    const res = await editorAgent
      .put(`/api/protocols/${original.body.id}`)
      .attach("file", MINIMAL_PDF, {
        filename: "new.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(200);
    expect(res.body.fileUrl).not.toBe(oldUrl);
    expect(mockUpload).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith(
      oldUrl.replace("https://test-public.r2.dev/", ""),
    );
  });
});

describe("DELETE /api/protocols/:id", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app).delete("/api/protocols/some-id");
    expect(res.status).toBe(401);
  });

  it("returns 404 when the protocol does not exist", async () => {
    const res = await editorAgent.delete("/api/protocols/nope-not-a-real-id");
    expect(res.status).toBe(404);
  });

  it("returns 204, removes the DB row, and deletes the storage object", async () => {
    const created = await editorAgent
      .post("/api/protocols")
      .field("gremium", "ASTA")
      .field("title", uniqueTitle("to-delete"))
      .field("meetingDate", "2026-04-15T18:00:00.000Z")
      .attach("file", MINIMAL_PDF, {
        filename: "doomed.pdf",
        contentType: "application/pdf",
      })
      .expect(201);

    const fileUrl = created.body.fileUrl as string;
    expect(mockUpload).toHaveBeenCalledTimes(1);

    const res = await editorAgent.delete(`/api/protocols/${created.body.id}`);
    expect(res.status).toBe(204);

    const row = await prisma.protocol.findUnique({
      where: { id: created.body.id },
    });
    expect(row).toBeNull();

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith(
      fileUrl.replace("https://test-public.r2.dev/", ""),
    );
  });
});
