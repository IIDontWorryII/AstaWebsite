// server/pages.crud.test.ts
//
// Tests for the Gremium pages API:
//   - GET /api/pages/:slug                  (public)
//   - PUT /api/admin/sections/:id           (EDITOR)
//   - POST /api/admin/pages/:slug/sections  (EDITOR)
//   - DELETE /api/admin/sections/:id        (EDITOR)
//   - POST /api/admin/sections/:id/move     (EDITOR)
//
// Same mock-the-storage strategy as the events / protocols crud tests so
// we never hit Cloudflare R2.

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

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

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
  // Clean up any sections we added in POST tests so re-runs are clean.
  // Test sections are identified by a marker substring in subtitle.
  await prisma.pageSection.deleteMany({
    where: { subtitle: { startsWith: "test-crud-" } },
  });
  await prisma.$disconnect();
});

function uniqueSubtitle(label: string): string {
  return `test-crud-${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

// Helper: fetch the ASTA page so we have a known set of seeded sections to
// poke at. Returns the parsed body.
async function fetchAsta(): Promise<{ sections: { id: string; kind: string; order: number; subtitle: string | null; body: string | null }[] }> {
  const res = await request(app).get("/api/pages/asta").expect(200);
  return res.body;
}

describe("GET /api/pages/:slug", () => {
  it("returns the seeded ASTA page with its sections ordered by 'order'", async () => {
    const res = await request(app).get("/api/pages/asta");
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("asta");
    expect(Array.isArray(res.body.sections)).toBe(true);
    expect(res.body.sections.length).toBeGreaterThan(0);

    // Sections come back sorted by order ascending.
    for (let i = 1; i < res.body.sections.length; i++) {
      expect(res.body.sections[i].order).toBeGreaterThan(
        res.body.sections[i - 1].order,
      );
    }

    // First section should be the INFO block.
    expect(res.body.sections[0].kind).toBe("INFO");
  });

  it("returns 404 for an unknown slug", async () => {
    const res = await request(app).get("/api/pages/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/admin/sections/:id", () => {
  it("rejects with 401 when not authenticated", async () => {
    const page = await fetchAsta();
    const res = await request(app)
      .put(`/api/admin/sections/${page.sections[0].id}`)
      .field("body", "new body");
    expect(res.status).toBe(401);
  });

  it("rejects with 403 when authenticated as USER role", async () => {
    const page = await fetchAsta();
    const userAgent = request.agent(app);
    const email = `test-crud-user-${Date.now()}@example.com`;
    await userAgent
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "Crud User" })
      .expect(200);
    const res = await userAgent
      .put(`/api/admin/sections/${page.sections[0].id}`)
      .field("body", "new body");
    expect(res.status).toBe(403);
    await prisma.user.deleteMany({ where: { email } });
  });

  it("returns 404 when the section doesn't exist", async () => {
    const res = await editorAgent
      .put("/api/admin/sections/nope-not-real")
      .field("body", "x");
    expect(res.status).toBe(404);
  });

  it("updates the body field (partial update preserves other fields)", async () => {
    const page = await fetchAsta();
    const sectionId = page.sections[0].id;
    const before = page.sections[0];
    const newBody = `Test body ${Date.now()}`;

    const res = await editorAgent
      .put(`/api/admin/sections/${sectionId}`)
      .field("body", newBody);

    expect(res.status).toBe(200);
    expect(res.body.body).toBe(newBody);
    // imageUrl untouched.
    expect(res.body.imageUrl).toBe(before.imageUrl ?? null);

    // Restore so other tests see the original body.
    await editorAgent
      .put(`/api/admin/sections/${sectionId}`)
      .field("body", before.body ?? "")
      .expect(200);
  });

  it("uploads new image to storage and deletes the old one (if it was an R2 URL)", async () => {
    // Use a throwaway REFERAT so this test isn't affected by other tests
    // mutating the seeded sections' imageUrls between runs.
    const created = await editorAgent
      .post("/api/admin/pages/asta/sections")
      .send({
        kind: "REFERAT",
        subtitle: uniqueSubtitle("img-test"),
        body: "x",
      })
      .expect(201);
    const sectionId = created.body.id;

    // First upload: no prior image at all → uploadObject called, delete is
    // not called (server skips delete when there's no existing url).
    const res = await editorAgent
      .put(`/api/admin/sections/${sectionId}`)
      .attach("image", ONE_PIXEL_PNG, {
        filename: "x.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toMatch(
      /^https:\/\/test-public\.r2\.dev\/page-sections\/[a-f0-9-]+\.png$/,
    );
    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledTimes(0);

    const [key, buffer, contentType] = mockUpload.mock.calls[0];
    expect(key).toMatch(/^page-sections\/[a-f0-9-]+\.png$/);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(contentType).toBe("image/png");

    // Second upload: existing url IS now an R2 URL → deleteObject called.
    const res2 = await editorAgent
      .put(`/api/admin/sections/${sectionId}`)
      .attach("image", ONE_PIXEL_PNG, {
        filename: "y.png",
        contentType: "image/png",
      });
    expect(res2.status).toBe(200);
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("removes the current image when removeImage=true is sent", async () => {
    // Throwaway REFERAT with an R2 image to delete.
    const created = await editorAgent
      .post("/api/admin/pages/asta/sections")
      .send({
        kind: "REFERAT",
        subtitle: uniqueSubtitle("rm-img"),
        body: "x",
      })
      .expect(201);
    const sectionId = created.body.id;

    // Give it an R2-hosted image first.
    const withImage = await editorAgent
      .put(`/api/admin/sections/${sectionId}`)
      .attach("image", ONE_PIXEL_PNG, {
        filename: "x.png",
        contentType: "image/png",
      })
      .expect(200);
    expect(withImage.body.imageUrl).not.toBeNull();

    // Now clear it via the removeImage flag (no file attached).
    const cleared = await editorAgent
      .put(`/api/admin/sections/${sectionId}`)
      .field("removeImage", "true")
      .expect(200);
    expect(cleared.body.imageUrl).toBeNull();
    // The old R2 object should have been deleted.
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it("clears optional fields when empty string is sent", async () => {
    const page = await fetchAsta();
    const referat = page.sections.find((s) => s.kind === "REFERAT");
    if (!referat) throw new Error("expected at least one REFERAT in ASTA");

    const res = await editorAgent
      .put(`/api/admin/sections/${referat.id}`)
      .field("email", "");

    expect(res.status).toBe(200);
    expect(res.body.email).toBeNull();

    // Restore — fetch a fresh referat to get its current email value.
    // (Seeded emails are stable; we send a sensible default if not present.)
    await editorAgent
      .put(`/api/admin/sections/${referat.id}`)
      .field("email", referat.email ?? "rac-asta-vorsitz@rheinahrcampus.de")
      .expect(200);
  });
});

describe("POST /api/admin/pages/:slug/sections", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/admin/pages/asta/sections")
      .send({ kind: "REFERAT" });
    expect(res.status).toBe(401);
  });

  it("returns 400 for non-REFERAT kinds (singletons can't be added)", async () => {
    const res = await editorAgent
      .post("/api/admin/pages/asta/sections")
      .send({ kind: "INFO" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/REFERAT/i);
  });

  it("returns 404 for an unknown page slug", async () => {
    const res = await editorAgent
      .post("/api/admin/pages/does-not-exist/sections")
      .send({ kind: "REFERAT" });
    expect(res.status).toBe(404);
  });

  it("creates a new MEMBER section (used for STUPA president/vice-president portraits)", async () => {
    const before = await request(app).get("/api/pages/stupa").expect(200);
    const lastOrder = before.body.sections[before.body.sections.length - 1].order;
    const subtitle = uniqueSubtitle("member");

    const res = await editorAgent
      .post("/api/admin/pages/stupa/sections")
      .send({
        kind: "MEMBER",
        subtitle,
        caption: "Test Person",
        body: "Test bio",
      });

    expect(res.status).toBe(201);
    expect(res.body.kind).toBe("MEMBER");
    expect(res.body.subtitle).toBe(subtitle);
    expect(res.body.caption).toBe("Test Person");
    expect(res.body.order).toBe(lastOrder + 1);
  });

  it("creates a new MENU section on the BaRACke page", async () => {
    const before = await request(app).get("/api/pages/baracke").expect(200);
    const lastOrder =
      before.body.sections[before.body.sections.length - 1].order;
    // subtitle isn't shown for MENU but lets afterAll clean this row up.
    const subtitle = uniqueSubtitle("menu");

    const res = await editorAgent
      .post("/api/admin/pages/baracke/sections")
      .send({ kind: "MENU", subtitle, caption: "Seite 3" });

    expect(res.status).toBe(201);
    expect(res.body.kind).toBe("MENU");
    expect(res.body.caption).toBe("Seite 3");
    expect(res.body.order).toBe(lastOrder + 1);
  });

  it("creates a new REFERAT appended to the end of the page", async () => {
    const before = await fetchAsta();
    const lastOrder = before.sections[before.sections.length - 1].order;
    const subtitle = uniqueSubtitle("create");

    const res = await editorAgent
      .post("/api/admin/pages/asta/sections")
      .send({
        kind: "REFERAT",
        subtitle,
        body: "Test referat body",
      });

    expect(res.status).toBe(201);
    expect(res.body.kind).toBe("REFERAT");
    expect(res.body.subtitle).toBe(subtitle);
    expect(res.body.order).toBe(lastOrder + 1);
  });
});

describe("DELETE /api/admin/sections/:id", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app).delete("/api/admin/sections/some-id");
    expect(res.status).toBe(401);
  });

  it("returns 404 when the section doesn't exist", async () => {
    const res = await editorAgent.delete("/api/admin/sections/nope");
    expect(res.status).toBe(404);
  });

  it("returns 204 and removes the section", async () => {
    // Create a throwaway section to delete.
    const created = await editorAgent
      .post("/api/admin/pages/asta/sections")
      .send({
        kind: "REFERAT",
        subtitle: uniqueSubtitle("delete"),
        body: "Doomed body",
      })
      .expect(201);

    const res = await editorAgent.delete(
      `/api/admin/sections/${created.body.id}`,
    );
    expect(res.status).toBe(204);

    // Verify it's gone from the DB.
    const row = await prisma.pageSection.findUnique({
      where: { id: created.body.id },
    });
    expect(row).toBeNull();
  });
});

describe("POST /api/admin/sections/:id/move", () => {
  it("rejects with 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/admin/sections/some-id/move")
      .send({ direction: "up" });
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid direction", async () => {
    const page = await fetchAsta();
    const res = await editorAgent
      .post(`/api/admin/sections/${page.sections[0].id}/move`)
      .send({ direction: "sideways" });
    expect(res.status).toBe(400);
  });

  it("swaps two adjacent sections' orders", async () => {
    // Set up by creating two known throwaway sections so we can swap them
    // without disturbing the seeded order.
    const a = await editorAgent
      .post("/api/admin/pages/asta/sections")
      .send({
        kind: "REFERAT",
        subtitle: uniqueSubtitle("move-a"),
        body: "A",
      })
      .expect(201);
    const b = await editorAgent
      .post("/api/admin/pages/asta/sections")
      .send({
        kind: "REFERAT",
        subtitle: uniqueSubtitle("move-b"),
        body: "B",
      })
      .expect(201);

    expect(b.body.order).toBe(a.body.order + 1);

    // Move A down → A and B should swap orders.
    const res = await editorAgent
      .post(`/api/admin/sections/${a.body.id}/move`)
      .send({ direction: "down" });
    expect(res.status).toBe(200);

    const aAfter = await prisma.pageSection.findUnique({
      where: { id: a.body.id },
    });
    const bAfter = await prisma.pageSection.findUnique({
      where: { id: b.body.id },
    });
    expect(aAfter?.order).toBe(b.body.order);
    expect(bAfter?.order).toBe(a.body.order);
  });

  it("is a no-op at the edge (moving last section down)", async () => {
    const page = await fetchAsta();
    const last = page.sections[page.sections.length - 1];

    const res = await editorAgent
      .post(`/api/admin/sections/${last.id}/move`)
      .send({ direction: "down" });
    expect(res.status).toBe(200);

    // Order unchanged.
    const after = await prisma.pageSection.findUnique({
      where: { id: last.id },
    });
    expect(after?.order).toBe(last.order);
  });
});

describe("PUT /api/admin/pages/:slug/hero", () => {
  it("rejects with 403 when authenticated as USER role", async () => {
    const userAgent = request.agent(app);
    const email = `test-crud-hero-user-${Date.now()}@example.com`;
    await userAgent
      .post("/api/signup")
      .send({ email, password: "password123", displayName: "Hero User" })
      .expect(200);
    const res = await userAgent
      .put("/api/admin/pages/asta/hero")
      .attach("image", ONE_PIXEL_PNG, {
        filename: "h.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(403);
    await prisma.user.deleteMany({ where: { email } });
  });

  it("sets a hero image and then clears it", async () => {
    const set = await editorAgent
      .put("/api/admin/pages/asta/hero")
      .attach("image", ONE_PIXEL_PNG, {
        filename: "h.png",
        contentType: "image/png",
      });
    expect(set.status).toBe(200);
    expect(set.body.heroImageUrl).toMatch(
      /^https:\/\/test-public\.r2\.dev\/page-sections\/[a-f0-9-]+\.png$/,
    );

    const cleared = await editorAgent
      .put("/api/admin/pages/asta/hero")
      .field("removeHero", "true");
    expect(cleared.status).toBe(200);
    expect(cleared.body.heroImageUrl).toBeNull();
  });

  it("returns 404 for an unknown page", async () => {
    const res = await editorAgent
      .put("/api/admin/pages/does-not-exist/hero")
      .field("removeHero", "true");
    expect(res.status).toBe(404);
  });

  it("returns 400 when no image and no removeHero flag is sent", async () => {
    const res = await editorAgent.put("/api/admin/pages/asta/hero").field("x", "y");
    expect(res.status).toBe(400);
  });
});
