// server/protocols.crud.test.ts
//
// Tests for POST, PUT, DELETE /api/protocols. Read tests live in
// protocols.test.ts. Mirrors events.crud.test.ts in structure.
//
// Strategy:
//   - One logged-in editorAgent reused across tests for cookie persistence.
//   - All created rows use title prefix "test-crud-" so afterAll can
//     clean them up plus any orphan PDFs on disk.
//   - PDFs are sent as small in-memory buffers (no fixture files needed).

import { existsSync } from "node:fs";
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { app, prisma } from "./app.js";
import { PROTOCOLS_UPLOAD_DIR } from "./upload/protocols.js";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin12345";
const TEST_TITLE_PREFIX = "test-crud-";

// Minimal valid PDF (PDF 1.4 with empty page). Multer's filter checks
// mime type, not magic bytes, so even a small text buffer with the right
// Content-Type would pass — but using a real PDF makes the test honest.
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

afterAll(async () => {
  const rows = await prisma.protocol.findMany({
    where: { title: { startsWith: TEST_TITLE_PREFIX } },
  });
  await prisma.protocol.deleteMany({
    where: { title: { startsWith: TEST_TITLE_PREFIX } },
  });
  for (const row of rows) {
    if (!row.fileUrl) continue;
    const file = path.join(PROTOCOLS_UPLOAD_DIR, path.basename(row.fileUrl));
    await unlink(file).catch(() => {});
  }
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

  it("creates a protocol with PDF and writes the file to disk", async () => {
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
    expect(res.body.fileUrl).toMatch(/^\/uploads\/protocols\/[a-f0-9-]+\.pdf$/);

    const filename = path.basename(res.body.fileUrl);
    expect(existsSync(path.join(PROTOCOLS_UPLOAD_DIR, filename))).toBe(true);
  });

  it("returns 400 when the PDF is missing (file is required)", async () => {
    const res = await editorAgent
      .post("/api/protocols")
      .field("gremium", "ASTA")
      .field("title", uniqueTitle("no-file"))
      .field("meetingDate", "2026-04-15T18:00:00.000Z");
    // No .attach() — file omitted
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/file is required/i);
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
  });

  it("returns 400 on disallowed mime type (e.g. text/plain)", async () => {
    const before = await readdir(PROTOCOLS_UPLOAD_DIR);
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
    const after = await readdir(PROTOCOLS_UPLOAD_DIR);
    expect(after.length).toBe(before.length);
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

  it("replaces the PDF and deletes the old file when a new one is uploaded", async () => {
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

    const oldFilename = path.basename(original.body.fileUrl);
    expect(existsSync(path.join(PROTOCOLS_UPLOAD_DIR, oldFilename))).toBe(true);

    const res = await editorAgent
      .put(`/api/protocols/${original.body.id}`)
      .attach("file", MINIMAL_PDF, {
        filename: "new.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(200);
    expect(res.body.fileUrl).not.toBe(original.body.fileUrl);
    expect(existsSync(path.join(PROTOCOLS_UPLOAD_DIR, oldFilename))).toBe(false);
    const newFilename = path.basename(res.body.fileUrl);
    expect(existsSync(path.join(PROTOCOLS_UPLOAD_DIR, newFilename))).toBe(true);
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

  it("returns 204 and removes the row plus the PDF file", async () => {
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

    const filename = path.basename(created.body.fileUrl);
    expect(existsSync(path.join(PROTOCOLS_UPLOAD_DIR, filename))).toBe(true);

    const res = await editorAgent.delete(
      `/api/protocols/${created.body.id}`,
    );
    expect(res.status).toBe(204);

    const row = await prisma.protocol.findUnique({
      where: { id: created.body.id },
    });
    expect(row).toBeNull();
    expect(existsSync(path.join(PROTOCOLS_UPLOAD_DIR, filename))).toBe(false);
  });
});
