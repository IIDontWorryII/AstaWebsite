import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../auth/passwords.js";
import { seedPages } from "./seed-pages.js";

const prisma = new PrismaClient();

const events = [
  {
    id: "event-sound-of-summer",
    title: "Sound of summer",
    description: "Campus Party",
    place: "Rheinahrcampus",
    startsAt: new Date("2026-05-30T18:00:00"),
  },
  {
    id: "event-house-night",
    title: "House night",
    description: "Baracke party with house music",
    place: "Baracke",
    startsAt: new Date("2026-05-07T20:00:00"),
  },
  {
    id: "event-night-beach",
    title: "Night Beach",
    description: "Beachvolleyball Turnier nach dem Sonnenuntergang ",
    place: "MBC",
    startsAt: new Date("2026-05-06T20:00:00"),
  },
];

const protocols = [
  {
    id: "protocol-asta-2026-04-15",
    gremium: "ASTA",
    title: "AStA-Sitzung — Sommerfest-Planung",
    meetingDate: new Date("2026-04-15"),
    fileUrl: "/uploads/protocols/asta-2026-04-15.pdf",
  },
  {
    id: "protocol-asta-2026-04-01",
    gremium: "ASTA",
    title: "AStA-Sitzung — Haushaltsentwurf",
    meetingDate: new Date("2026-04-01"),
    fileUrl: "/uploads/protocols/asta-2026-04-01.pdf",
  },
  {
    id: "protocol-stupa-2026-03-20",
    gremium: "STUPA",
    title: "StuPa-Sitzung — Wahlordnung",
    meetingDate: new Date("2026-03-20"),
    fileUrl: "/uploads/protocols/stupa-2026-03-20.pdf",
  },
];

const ADMINS = [
  {
    id: "user-admin",
    email: "admin@example.com",
    password: "admin12345", // plain, hashed during seed
    displayName: "Admin",
    role: "EDITOR",
  },
];

async function main() {
  for (const e of events) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: e,
      create: e,
    });
  }
  console.log(`Seeded ${events.length} events`);
  for (const p of protocols) {
    await prisma.protocol.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${protocols.length} protocols`);
  for (const u of ADMINS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {}, // do nothing if user exists
      create: {
        id: u.id,
        email: u.email,
        passwordHash: await hashPassword(u.password),
        displayName: u.displayName,
        role: u.role,
      },
    });
  }
  console.log(`Seeded ${ADMINS.length} users`);

  // Gremien pages (asta, stupa, fachschaften) + their sections. Idempotent:
  // pages are upserted, sections are only created if the page currently has
  // none (so admin edits survive seed re-runs).
  const sectionCount = await seedPages(prisma);
  console.log(`Seeded ${sectionCount} page sections`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
