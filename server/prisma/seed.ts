import { PrismaClient } from "@prisma/client";

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
