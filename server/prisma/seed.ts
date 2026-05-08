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

async function main() {
  for (const e of events) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: e,
      create: e,
    });
  }
  console.log(`Seeded ${events.length} events`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
