// server/app.ts
//
// Builds and exports the Express `app` without binding it to a port.
// Tests import this directly and pass it to supertest, which runs the app
// on an ephemeral port for each request — no real `.listen()` needed.
//
// `index.ts` is the production entry point: it imports `app` from here and
// calls `app.listen()`.

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
import { signToken, verifyToken } from "./auth/tokens.js";

export const prisma = new PrismaClient();
export const app = express();

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

// `credentials: true` lets the browser include cookies on cross-origin
// requests. In dev the Vite proxy forwards everything from :5173 to :5000
// so cookies "just work", but enabling this also covers the case where
// someone hits the API directly (e.g. from Postman or another origin).
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.send("ASTAWebsite API is running");
});

app.get("/api/health", (_req: Request, res: Response<HealthResponse>) => {
  res.json({ status: "ok", version: "0.1.0" });
});

app.get("/api/events", async (_req: Request, res: Response<EventDTO[]>) => {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });
  res.json(
    events.map((e) => ({
      ...e,
      startsAt: e.startsAt.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
  );
});

app.get(
  "/api/protocols",
  async (req: Request, res: Response<ProtocolDTO[]>) => {
    const gremium =
      typeof req.query.gremium === "string" ? req.query.gremium : undefined;

    const protocols = await prisma.protocol.findMany({
      where: gremium ? { gremium } : undefined,
      orderBy: { meetingDate: "desc" },
    });
    res.json(
      protocols.map((p) => ({
        ...p,
        meetingDate: p.meetingDate.toISOString(),
        uploadedAt: p.uploadedAt.toISOString(),
      })),
    );
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

app.get(
  "/api/me",
  async (req: Request, res: Response<AuthResponse | { error: string }>) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const { sub } = verifyToken(token);
      const user = await prisma.user.findUnique({ where: { id: sub } });
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role as "USER" | "EDITOR",
          createdAt: user.createdAt.toISOString(),
        },
      });
    } catch {
      return res.status(401).json({ error: "Not authenticated" });
    }
  },
);
