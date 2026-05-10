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
import { PrismaClient } from "@prisma/client";
import type { EventDTO, HealthResponse } from "../shared/types.js";

export const prisma = new PrismaClient();

export const app = express();

app.use(cors());
app.use(express.json());

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
