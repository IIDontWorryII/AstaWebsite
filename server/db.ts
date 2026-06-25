// server/db.ts
//
// Single place that builds the Prisma client, wired to Neon's serverless
// driver so queries travel over WebSocket (port 443). Postgres' native port
// (5432) is blocked on some networks (e.g. campus WiFi); 443 is open
// everywhere, so this lets the app connect regardless of network.
//
// Requires `previewFeatures = ["driverAdapters"]` in schema.prisma.
//
// NOTE: this only affects the running app's queries. Schema migrations
// (`prisma migrate`) still use a direct 5432 connection — run those from a
// network that allows 5432 (or apply the SQL via the Neon console).

import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// In Node there's no global WebSocket; the serverless driver needs one.
neonConfig.webSocketConstructor = ws;

export function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}
