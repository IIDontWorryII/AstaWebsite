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
} from "../shared/types.js";
import { hashPassword, verifyPassword } from "./auth/passwords.js";
import { signToken } from "./auth/tokens.js";
import { setAuthCookie, clearAuthCookie } from "./auth/cookie.js";
import { requireAuth, requireEditor } from "./auth/middleware.js";
import {
  EVENTS_UPLOAD_DIR,
  EVENTS_PUBLIC_PREFIX,
  deleteEventPosterByUrl,
  parseEventPoster,
  publicUrlFor,
} from "./upload/events.js";
import { corsOptions } from "./auth/cors.js";
import { EventCreateInput, EventUpdateInput } from "./events/schemas.js";
import { toEventDTO } from "./events/dto.js";
import {
  PROTOCOLS_UPLOAD_DIR,
  PROTOCOLS_PUBLIC_PREFIX,
  deleteProtocolFileByUrl,
  parseProtocolFile,
  publicUrlFor as protocolPublicUrl,
} from "./upload/protocols.js";
import {
  ProtocolCreateInput,
  ProtocolUpdateInput,
} from "./protocols/schemas.js";
import { toProtocolDTO } from "./protocols/dto.js";

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

// Serve uploaded files (event posters, protocol PDFs) as static assets.
// E.g. an event with imageUrl "/uploads/events/abc.jpg" is fetched by the
// browser from GET /uploads/events/abc.jpg, served directly off disk.
app.use(EVENTS_PUBLIC_PREFIX, express.static(EVENTS_UPLOAD_DIR));
app.use(PROTOCOLS_PUBLIC_PREFIX, express.static(PROTOCOLS_UPLOAD_DIR));

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
app.post(
  "/api/events",
  requireEditor,
  parseEventPoster,
  async (req: Request, res: Response<EventDTO | { error: string }>) => {
    const parsed = EventCreateInput.safeParse(req.body);
    if (!parsed.success) {
      // If multer already wrote a file, clean it up — we're rejecting the row.
      if (req.file) await deleteEventPosterByUrl(publicUrlFor(req.file.filename));
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        place: data.place,
        startsAt: new Date(data.startsAt),
        price: data.price ?? null,
        imageUrl: req.file ? publicUrlFor(req.file.filename) : null,
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
      if (req.file) await deleteEventPosterByUrl(publicUrlFor(req.file.filename));
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    // If a new image was uploaded, we need to delete the old one. Look up
    // the existing row first so we know what to clean.
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      if (req.file) await deleteEventPosterByUrl(publicUrlFor(req.file.filename));
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
      imageUrl?: string | null;
    } = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.place !== undefined) updatePayload.place = data.place;
    if (data.startsAt !== undefined) updatePayload.startsAt = new Date(data.startsAt);
    if (data.price !== undefined) updatePayload.price = data.price;
    if (req.file) {
      // New image — delete the previous one and point to the new file.
      await deleteEventPosterByUrl(existing.imageUrl);
      updatePayload.imageUrl = publicUrlFor(req.file.filename);
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
app.post(
  "/api/protocols",
  requireEditor,
  parseProtocolFile,
  async (req: Request, res: Response<ProtocolDTO | { error: string }>) => {
    // The PDF is the whole point — reject if missing.
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    const parsed = ProtocolCreateInput.safeParse(req.body);
    if (!parsed.success) {
      // Clean up the orphan upload before rejecting.
      await deleteProtocolFileByUrl(protocolPublicUrl(req.file.filename));
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    const protocol = await prisma.protocol.create({
      data: {
        gremium: data.gremium,
        title: data.title,
        meetingDate: new Date(data.meetingDate),
        fileUrl: protocolPublicUrl(req.file.filename),
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
      if (req.file)
        await deleteProtocolFileByUrl(protocolPublicUrl(req.file.filename));
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const data = parsed.data;

    const existing = await prisma.protocol.findUnique({ where: { id } });
    if (!existing) {
      if (req.file)
        await deleteProtocolFileByUrl(protocolPublicUrl(req.file.filename));
      return res.status(404).json({ error: "Protocol not found" });
    }

    const updatePayload: {
      gremium?: string;
      title?: string;
      meetingDate?: Date;
      fileUrl?: string;
    } = {};
    if (data.gremium !== undefined) updatePayload.gremium = data.gremium;
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.meetingDate !== undefined)
      updatePayload.meetingDate = new Date(data.meetingDate);
    if (req.file) {
      await deleteProtocolFileByUrl(existing.fileUrl);
      updatePayload.fileUrl = protocolPublicUrl(req.file.filename);
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

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: "USER",
          createdAt: user.createdAt.toISOString(),
        },
      });
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

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role,
        createdAt: user.createdAt.toISOString(),
      },
    });
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

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role as "USER" | "EDITOR",
        createdAt: user.createdAt.toISOString(),
      },
    });
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
