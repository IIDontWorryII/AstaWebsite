// server/app.ts
//
// Builds and exports the Express `app` without binding it to a port.
// Tests import this directly and pass it to supertest, which runs the app
// on an ephemeral port for each request — no real `.listen()` needed.
//
// `index.ts` is the production entry point: it imports `app` from here and
// calls `app.listen()`.

import path from "node:path";
import { existsSync } from "node:fs";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Prisma, PrismaClient } from "@prisma/client";
import type {
  EventDTO,
  ProtocolDTO,
  HealthResponse,
  AuthResponse,
  PageDTO,
  PageSectionDTO,
  PublicUser,
} from "../shared/types.js";
import { hashPassword, verifyPassword } from "./auth/passwords.js";
import { signToken } from "./auth/tokens.js";
import { setAuthCookie, clearAuthCookie } from "./auth/cookie.js";
import { requireAuth, requireEditor } from "./auth/middleware.js";
import {
  deleteEventPosterByUrl,
  parseEventPoster,
  storeEventPoster,
} from "./upload/events.js";
import { corsOptions } from "./auth/cors.js";
import { EventCreateInput, EventUpdateInput } from "./events/schemas.js";
import { toEventDTO } from "./events/dto.js";
import {
  deleteProtocolFileByUrl,
  parseProtocolFile,
  storeProtocolFile,
} from "./upload/protocols.js";
import {
  ProtocolCreateInput,
  ProtocolUpdateInput,
} from "./protocols/schemas.js";
import { toProtocolDTO } from "./protocols/dto.js";
import {
  PageSectionCreateInput,
  PageSectionUpdateInput,
} from "./pages/schemas.js";
import { toPageDTO, toPageSectionDTO } from "./pages/dto.js";
import {
  deleteSectionImageByUrl,
  parseSectionImage,
  storeSectionImage,
} from "./upload/sectionImages.js";
import {
  deleteAvatarImageByUrl,
  parseAvatarImage,
  storeAvatarImage,
} from "./upload/avatarImages.js";

export const prisma = new PrismaClient();
export const app = express();

// CORS allows the browser to include cookies on cross-origin requests
// (credentials: true). Allowed origins depend on environment:
//   - dev: any origin (Vite proxy + Postman + curl all work)
//   - prod: comma-separated list from CORS_ORIGIN env var
// See server/auth/cors.ts for the full policy.
app.use(cors(corsOptions()));
app.use(express.json());
app.use(cookieParser());

// NOTE: We used to serve /uploads/* off the local filesystem here.
// Uploads now live in Cloudflare R2 — the browser fetches them directly
// from the R2 public URL stored in each row's imageUrl / fileUrl field.
// No Express static middleware needed for those paths.

app.get("/api/health", (_req: Request, res: Response<HealthResponse>) => {
  res.json({ status: "ok", version: "0.1.0" });
});

app.get("/api/events", async (_req: Request, res: Response<EventDTO[]>) => {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });
  res.json(events.map(toEventDTO));
});

// Create event. EDITOR only. Accepts multipart/form-data with text fields
// (title, description, place, startsAt, price?) and an optional `image` file.
//
// Multer keeps the file in memory (req.file.buffer); we only push it to
// R2 *after* zod validation passes, so a 400 has zero cleanup cost.
app.post(
  "/api/events",
  requireEditor,
  parseEventPoster,
  async (req: Request, res: Response<EventDTO | { error: string }>) => {
    const parsed = EventCreateInput.safeParse(req.body);
    if (!parsed.success) {
      // No cleanup needed — req.file.buffer is just an in-memory blob.
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    const imageUrl = req.file ? await storeEventPoster(req.file) : null;

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        place: data.place,
        startsAt: new Date(data.startsAt),
        price: data.price ?? null,
        category: data.category ? data.category : null,
        imageUrl,
      },
    });

    return res.status(201).json(toEventDTO(event));
  },
);

// Update event. EDITOR only. Partial update — only fields in the request
// body are changed. If a new image is uploaded, it replaces the old one
// (old file deleted from disk). Missing image = keep existing.
app.put(
  "/api/events/:id",
  requireEditor,
  parseEventPoster,
  // Request<{ id: string }> declares the expected URL params so req.params.id
  // is typed as `string` (Express 5's default is wider: `string | string[]`).
  async (
    req: Request<{ id: string }>,
    res: Response<EventDTO | { error: string }>,
  ) => {
    const { id } = req.params;

    const parsed = EventUpdateInput.safeParse(req.body);
    if (!parsed.success) {
      // No cleanup needed — buffer never reached R2.
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    // Look up the existing row first so we know what (if any) old image
    // to delete from R2 if a replacement was uploaded.
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Build the update payload conditionally — only include keys the
    // client actually sent. This is what makes the update "partial".
    const updatePayload: {
      title?: string;
      description?: string;
      place?: string;
      startsAt?: Date;
      price?: string | null;
      category?: string | null;
      imageUrl?: string | null;
    } = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.place !== undefined) updatePayload.place = data.place;
    if (data.startsAt !== undefined) updatePayload.startsAt = new Date(data.startsAt);
    if (data.price !== undefined) updatePayload.price = data.price;
    // Empty string clears the category (set null); a real value sets it.
    if (data.category !== undefined)
      updatePayload.category = data.category ? data.category : null;
    if (req.file) {
      // Upload new image to R2, then delete the previous one from R2.
      // Order matters: upload first so we don't lose both if upload fails.
      updatePayload.imageUrl = await storeEventPoster(req.file);
      await deleteEventPosterByUrl(existing.imageUrl);
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updatePayload,
    });

    return res.json(toEventDTO(updated));
  },
);

// Delete event. EDITOR only. Removes the row AND the image file from disk.
app.delete(
  "/api/events/:id",
  requireEditor,
  async (
    req: Request<{ id: string }>,
    res: Response<{ error: string } | undefined>,
  ) => {
    const { id } = req.params;

    // Look up first so we know the imageUrl for disk cleanup.
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Event not found" });
    }

    await prisma.event.delete({ where: { id } });
    await deleteEventPosterByUrl(existing.imageUrl);

    // 204 No Content — successful delete with no body to return.
    return res.status(204).send();
  },
);

app.get(
  "/api/protocols",
  async (req: Request, res: Response<ProtocolDTO[]>) => {
    const gremium =
      typeof req.query.gremium === "string" ? req.query.gremium : undefined;

    const protocols = await prisma.protocol.findMany({
      where: gremium ? { gremium } : undefined,
      orderBy: { meetingDate: "desc" },
    });
    res.json(protocols.map(toProtocolDTO));
  },
);

// Create protocol. EDITOR only. Accepts multipart/form-data with text
// fields (gremium, title, meetingDate) and a REQUIRED `file` PDF upload.
//
// Multer keeps the file in memory; we only push it to R2 after zod passes.
app.post(
  "/api/protocols",
  requireEditor,
  parseProtocolFile,
  async (req: Request, res: Response<ProtocolDTO | { error: string }>) => {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const parsed = ProtocolCreateInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    const fileUrl = await storeProtocolFile(req.file);

    const protocol = await prisma.protocol.create({
      data: {
        gremium: data.gremium,
        title: data.title,
        description: data.description || null,
        meetingDate: new Date(data.meetingDate),
        fileUrl,
      },
    });

    return res.status(201).json(toProtocolDTO(protocol));
  },
);

// Update protocol. EDITOR only. Partial update — only fields present in
// the request body change. If a new PDF is uploaded, it replaces the old
// one (old file deleted from disk). Missing PDF = keep existing.
app.put(
  "/api/protocols/:id",
  requireEditor,
  parseProtocolFile,
  async (
    req: Request<{ id: string }>,
    res: Response<ProtocolDTO | { error: string }>,
  ) => {
    const { id } = req.params;

    const parsed = ProtocolUpdateInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    const existing = await prisma.protocol.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Protocol not found" });
    }

    const updatePayload: {
      gremium?: string;
      title?: string;
      description?: string | null;
      meetingDate?: Date;
      fileUrl?: string;
    } = {};
    if (data.gremium !== undefined) updatePayload.gremium = data.gremium;
    if (data.title !== undefined) updatePayload.title = data.title;
    // Empty string clears the description.
    if (data.description !== undefined)
      updatePayload.description = data.description === "" ? null : data.description;
    if (data.meetingDate !== undefined)
      updatePayload.meetingDate = new Date(data.meetingDate);
    if (req.file) {
      // Upload first so we don't lose both if R2 upload fails.
      updatePayload.fileUrl = await storeProtocolFile(req.file);
      await deleteProtocolFileByUrl(existing.fileUrl);
    }

    const updated = await prisma.protocol.update({
      where: { id },
      data: updatePayload,
    });
    return res.json(toProtocolDTO(updated));
  },
);

// Delete protocol. EDITOR only. Removes the row AND the PDF file from disk.
app.delete(
  "/api/protocols/:id",
  requireEditor,
  async (
    req: Request<{ id: string }>,
    res: Response<{ error: string } | undefined>,
  ) => {
    const { id } = req.params;

    const existing = await prisma.protocol.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Protocol not found" });
    }

    await prisma.protocol.delete({ where: { id } });
    await deleteProtocolFileByUrl(existing.fileUrl);
    return res.status(204).send();
  },
);

// Serialize a Prisma User row into the public (no password hash) shape the
// frontend consumes. Single source of truth for signup/login/me/PATCH.
function toPublicUser(user: {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role as "USER" | "EDITOR",
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

app.post(
  "/api/signup",
  async (req: Request, res: Response<AuthResponse | { error: string }>) => {
    const { email, password, displayName } = req.body;

    // Inline validation. Early returns, no nesting.
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof displayName !== "string"
    ) {
      return res
        .status(400)
        .json({ error: "email, password, and displayName are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: await hashPassword(password),
          displayName,
          role: "USER", // hardcoded — never trust client to set their own role
        },
      });

      const token = signToken({ sub: user.id, role: "USER" });
      setAuthCookie(res, token);

      return res.json({ user: toPublicUser(user) });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        return res.status(409).json({ error: "Email already registered" });
      }
      throw e;
    }
  },
);

app.post(
  "/api/login",
  async (req: Request, res: Response<AuthResponse | { error: string }>) => {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: "email and password are required" });
    }

    // Look up the user. If no user OR password mismatch, return the SAME
    // generic error — never reveal which field was wrong (prevents
    // attackers from probing for valid emails).
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Track last login for auditing. Fire-and-forget: don't block the
    // response on this update.
    prisma.user
      .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
      .catch((err) => console.error("Failed to update lastLoginAt:", err));

    const role = user.role as "USER" | "EDITOR";
    const token = signToken({ sub: user.id, role });
    setAuthCookie(res, token);

    return res.json({ user: toPublicUser(user) });
  },
);

app.post("/api/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

// /api/me — return the current user. requireAuth handles the cookie/token
// check (returns 401 if missing/bad). The handler then loads the fresh user
// from the DB so the response reflects any role changes or display name
// edits since the token was issued (the middleware itself trusts the token
// for speed; this read is the source of truth for the frontend's user state).
app.get(
  "/api/me",
  requireAuth,
  async (req: Request, res: Response<AuthResponse | { error: string }>) => {
    // requireAuth guarantees req.user is set; the `!` asserts that to TS.
    const { id } = req.user!;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      // Token was valid but the user was deleted. Treat as logged out.
      return res.status(401).json({ error: "Not authenticated" });
    }

    return res.json({ user: toPublicUser(user) });
  },
);

// Update the current user's profile: display name and/or avatar. Multipart
// so an optional new avatar image can ride along. `removeAvatar=true` clears
// the current avatar (and deletes it from R2). A new upload always wins.
app.patch(
  "/api/me",
  requireAuth,
  parseAvatarImage,
  async (req: Request, res: Response<AuthResponse | { error: string }>) => {
    const { id } = req.user!;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const updatePayload: { displayName?: string; avatarUrl?: string | null } =
      {};

    // displayName: optional, but if present must be non-empty.
    if (typeof req.body.displayName === "string") {
      const name = req.body.displayName.trim();
      if (name.length === 0) {
        return res.status(400).json({ error: "Name darf nicht leer sein" });
      }
      updatePayload.displayName = name;
    }

    if (req.file) {
      // Upload new avatar first, then delete the old one from R2.
      updatePayload.avatarUrl = await storeAvatarImage(req.file);
      await deleteAvatarImageByUrl(existing.avatarUrl);
    } else if (req.body.removeAvatar === "true") {
      updatePayload.avatarUrl = null;
      await deleteAvatarImageByUrl(existing.avatarUrl);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updatePayload,
    });
    return res.json({ user: toPublicUser(user) });
  },
);

// Change the current user's password. Requires the current password (proof
// of identity) and a new password meeting the same rule as signup.
app.post(
  "/api/me/password",
  requireAuth,
  async (req: Request, res: Response<{ ok: true } | { error: string }>) => {
    const { id } = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword are required" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      return res.status(400).json({ error: "Aktuelles Passwort ist falsch" });
    }

    await prisma.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    return res.json({ ok: true });
  },
);

// ─── Event favorites (Merkliste, auth only) ────────────────────────────

// List the current user's favorited events (most recently added first).
app.get(
  "/api/me/favorites",
  requireAuth,
  async (req: Request, res: Response<EventDTO[] | { error: string }>) => {
    const { id } = req.user!;
    const favs = await prisma.favorite.findMany({
      where: { userId: id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(favs.map((f) => toEventDTO(f.event)));
  },
);

// Add a favorite. Idempotent: re-favoriting an event is a no-op.
app.post(
  "/api/me/favorites/:eventId",
  requireAuth,
  async (
    req: Request<{ eventId: string }>,
    res: Response<{ ok: true } | { error: string }>,
  ) => {
    const { id } = req.user!;
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    await prisma.favorite.upsert({
      where: { userId_eventId: { userId: id, eventId } },
      update: {},
      create: { userId: id, eventId },
    });
    return res.status(201).json({ ok: true });
  },
);

// Remove a favorite. Idempotent: removing a non-favorite returns 204 too.
app.delete(
  "/api/me/favorites/:eventId",
  requireAuth,
  async (
    req: Request<{ eventId: string }>,
    res: Response<{ error: string } | undefined>,
  ) => {
    const { id } = req.user!;
    const { eventId } = req.params;
    await prisma.favorite.deleteMany({ where: { userId: id, eventId } });
    return res.status(204).send();
  },
);

// ─── Gremium pages (read) ──────────────────────────────────────────────

// Public: fetch a single Gremium page with all its sections, ordered.
app.get(
  "/api/pages/:slug",
  async (
    req: Request<{ slug: string }>,
    res: Response<PageDTO | { error: string }>,
  ) => {
    const { slug } = req.params;
    const page = await prisma.page.findUnique({
      where: { slug },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }
    return res.json(toPageDTO(page));
  },
);

// ─── Gremium page section editing (admin only) ─────────────────────────

// Update a section's editable fields. Multipart so an optional new image
// can ride along. Text fields not present in the body are left unchanged;
// EMPTY STRINGS on optional fields (subtitle/caption/email) are treated
// as "clear this field" → null in the DB. body cannot be cleared (the
// section would render empty).
app.put(
  "/api/admin/sections/:id",
  requireEditor,
  parseSectionImage,
  async (
    req: Request<{ id: string }>,
    res: Response<PageSectionDTO | { error: string }>,
  ) => {
    const { id } = req.params;

    const parsed = PageSectionUpdateInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    const existing = await prisma.pageSection.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Section not found" });
    }

    // Build the update payload conditionally. For optional text fields,
    // empty string means "set null", a real value means "set string".
    const updatePayload: {
      subtitle?: string | null;
      body?: string;
      caption?: string | null;
      email?: string | null;
      imageUrl?: string | null;
    } = {};
    if (data.subtitle !== undefined) {
      updatePayload.subtitle = data.subtitle === "" ? null : data.subtitle;
    }
    if (data.body !== undefined) updatePayload.body = data.body;
    if (data.caption !== undefined) {
      updatePayload.caption = data.caption === "" ? null : data.caption;
    }
    if (data.email !== undefined) {
      updatePayload.email = data.email === "" ? null : data.email;
    }
    if (req.file) {
      // Upload new image first so we don't lose both if R2 fails.
      updatePayload.imageUrl = await storeSectionImage(req.file);
      // Then delete the old image from R2 (only if it was an R2-hosted one;
      // local /referate/* paths are bundled assets, not R2 — silent no-op).
      await deleteSectionImageByUrl(existing.imageUrl);
    } else if (data.removeImage === "true") {
      // No new file, but the editor asked to clear the current image.
      updatePayload.imageUrl = null;
      await deleteSectionImageByUrl(existing.imageUrl);
    }

    const updated = await prisma.pageSection.update({
      where: { id },
      data: updatePayload,
    });
    return res.json(toPageSectionDTO(updated));
  },
);

// Add a new section to a page. Only multi-instance kinds are allowed here —
// INFO/MITGLIEDER/FREEFORM are singletons (the schema doesn't enforce that
// but the UI should and we reject other kinds here as a backstop).
app.post(
  "/api/admin/pages/:slug/sections",
  requireEditor,
  async (
    req: Request<{ slug: string }>,
    res: Response<PageSectionDTO | { error: string }>,
  ) => {
    const { slug } = req.params;

    const parsed = PageSectionCreateInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    // Multi-instance kinds that the UI lets editors add freely. INFO,
    // MITGLIEDER, FREEFORM are singletons and can't be created via this
    // route — they're seeded once and edited in place.
    const ADDABLE_KINDS = ["REFERAT", "MEMBER", "MENU", "GALLERY"] as const;
    if (!ADDABLE_KINDS.includes(data.kind as (typeof ADDABLE_KINDS)[number])) {
      return res.status(400).json({
        error: `Only ${ADDABLE_KINDS.join(", ")} sections can be added via this route`,
      });
    }

    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    // Append to the end of the page's sections.
    const last = await prisma.pageSection.findFirst({
      where: { pageId: page.id },
      orderBy: { order: "desc" },
    });
    const nextOrder = (last?.order ?? -1) + 1;

    const created = await prisma.pageSection.create({
      data: {
        pageId: page.id,
        order: nextOrder,
        kind: data.kind,
        subtitle: data.subtitle ?? null,
        body: data.body ?? null,
        caption: data.caption ?? null,
        email: data.email ?? null,
      },
    });
    return res.status(201).json(toPageSectionDTO(created));
  },
);

// Delete a section. Also cleans up the section's image in R2 if it's
// an R2-hosted URL (bundled local /referate/* paths are no-op).
app.delete(
  "/api/admin/sections/:id",
  requireEditor,
  async (
    req: Request<{ id: string }>,
    res: Response<{ error: string } | undefined>,
  ) => {
    const { id } = req.params;
    const existing = await prisma.pageSection.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Section not found" });
    }

    await prisma.pageSection.delete({ where: { id } });
    await deleteSectionImageByUrl(existing.imageUrl);

    return res.status(204).send();
  },
);

// Reorder a section by swapping its `order` with the adjacent neighbor.
// Direction is "up" (towards lower order) or "down" (higher order).
// No-op at the edges (already first / last on the page).
app.post(
  "/api/admin/sections/:id/move",
  requireEditor,
  async (
    req: Request<{ id: string }>,
    res: Response<PageSectionDTO[] | { error: string }>,
  ) => {
    const { id } = req.params;
    const direction = req.body?.direction;
    if (direction !== "up" && direction !== "down") {
      return res
        .status(400)
        .json({ error: "direction must be 'up' or 'down'" });
    }

    const section = await prisma.pageSection.findUnique({ where: { id } });
    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }

    // Find the neighbor in the requested direction.
    const neighbor = await prisma.pageSection.findFirst({
      where: {
        pageId: section.pageId,
        order: direction === "up" ? { lt: section.order } : { gt: section.order },
      },
      orderBy: { order: direction === "up" ? "desc" : "asc" },
    });
    if (!neighbor) {
      // Already at the edge — return the page's sections unchanged so
      // the client can re-render without special-casing.
      const sections = await prisma.pageSection.findMany({
        where: { pageId: section.pageId },
        orderBy: { order: "asc" },
      });
      return res.json(sections.map(toPageSectionDTO));
    }

    // Swap orders inside a transaction so we never end up with two
    // sections sharing the same order value mid-way.
    await prisma.$transaction([
      prisma.pageSection.update({
        where: { id: section.id },
        data: { order: neighbor.order },
      }),
      prisma.pageSection.update({
        where: { id: neighbor.id },
        data: { order: section.order },
      }),
    ]);

    const sections = await prisma.pageSection.findMany({
      where: { pageId: section.pageId },
      orderBy: { order: "asc" },
    });
    return res.json(sections.map(toPageSectionDTO));
  },
);

// ─── Serve the built frontend (production) ─────────────────────────────
//
// After `npm run build` in client/, Vite outputs static files to
// client/dist/. In production we serve them straight off Express:
//   - express.static() returns real files for asset paths (/assets/*.js,
//     /favicon.ico, etc.). Falls through to the next middleware for paths
//     that don't match a file.
//   - A catch-all returns index.html for any non-API, non-asset GET so
//     React Router URLs (e.g. /admin/events, /gremien/asta) work on
//     direct visit and on page refresh.
//
// We register this AFTER all the API routes so /api/* never accidentally
// gets index.html. We only activate it when client/dist exists — in dev
// the user runs the Vite dev server on :5173, and the Express server on
// :5000 doesn't need to serve any HTML.

const CLIENT_DIST_DIR = path.join(process.cwd(), "..", "client", "dist");

if (existsSync(CLIENT_DIST_DIR)) {
  app.use(express.static(CLIENT_DIST_DIR));

  // SPA fallback. Express 5's path-to-regexp v6 requires named wildcards;
  // "/{*splat}" matches any path with at least one segment.
  app.get("/{*splat}", (_req: Request, res: Response) => {
    res.sendFile(path.join(CLIENT_DIST_DIR, "index.html"));
  });
}
