import "dotenv/config";
import { seedPages } from "./seed-pages.js";
import { createPrismaClient } from "../db.js";

const prisma = createPrismaClient();

const events = [
  {
    id: "event-sound-of-summer",
    title: "Sound of summer",
    description: "Campus Party",
    place: "Rheinahrcampus",
    categories: ["EVENT"],
    startsAt: new Date("2026-05-30T18:00:00"),
  },
  {
    id: "event-house-night",
    title: "House night",
    description: "Baracke party with house music",
    place: "Baracke",
    categories: ["BARACKE"],
    startsAt: new Date("2026-05-07T20:00:00"),
  },
  {
    id: "event-night-beach",
    title: "Night Beach",
    description: "Beachvolleyball Turnier nach dem Sonnenuntergang ",
    place: "MBC",
    categories: ["SPORT"],
    startsAt: new Date("2026-05-06T20:00:00"),
  },
  {
    id: "event-rac-sportturnier",
    title: "RAC Sportturnier",
    description: "Hochschulweites Turnier in mehreren Sportarten.",
    place: "Sporthalle Remagen",
    categories: ["SPORT"],
    startsAt: new Date("2026-09-15T16:00:00"),
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

// NOTE: no default admin is seeded — a hardcoded password is a security risk
// on a live DB. Editor accounts are created by signing up and being promoted
// (or via SAML). To provision a first editor, use `npm run set-editor`.

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

  // Gremien pages (asta, stupa, fachschaften) + their sections. Idempotent:
  // pages are upserted, sections are only created if the page currently has
  // none (so admin edits survive seed re-runs).
  const sectionCount = await seedPages(prisma);
  console.log(`Seeded ${sectionCount} page sections`);

  await seedErsti();
}

// Ersti-Info page: STEP + FAQ sections (editable in Seiteninhalte) and the
// singleton ErstiInfo row for the Fristen block. Idempotent — sections are
// only seeded when the page has none, so admin edits survive re-runs.
const ERSTI_STEPS = [
  "Uni-Account aktivieren und Passwort setzen",
  "Uni-Mail (SoGo) einrichten und regelmäßig checken",
  "WLAN „eduroam“ auf Handy & Laptop einrichten",
  "Kurse/Module in OLAT belegen",
  "Semesterbeitrag fristgerecht zahlen (sonst droht die Exmatrikulation)",
  "Studierendenausweis & Semesterticket abholen",
  "Prüfungen im ICMS anmelden – auf die Frist achten!",
];

const ERSTI_FAQ: [string, string][] = [
  [
    "Wie melde ich mich für Prüfungen an?",
    "Über das ICMS innerhalb des Anmeldezeitraums. Den genauen Zeitraum gibt die Hochschule jedes Semester bekannt – behalte SoGo und ICMS im Blick.",
  ],
  [
    "Was passiert, wenn ich den Semesterbeitrag nicht zahle?",
    "Ohne fristgerechte Zahlung (Rückmeldung) wirst du exmatrikuliert. Zahl also unbedingt rechtzeitig.",
  ],
  [
    "Wo finde ich meinen Stundenplan?",
    "Deine Veranstaltungen findest du in OLAT; den Plan stellst du dir aus den belegten Modulen zusammen.",
  ],
  [
    "Was deckt das Semesterticket ab?",
    "Es ist auf deinem Studierendenausweis hinterlegt. Welche Verkehrsmittel und Regionen es abdeckt, steht auf den Seiten der Hochschule bzw. des AStA.",
  ],
];

async function seedErsti() {
  const page = await prisma.page.upsert({
    where: { slug: "ersti" },
    update: {},
    create: { slug: "ersti", title: "Ersti-Info" },
  });

  const existing = await prisma.pageSection.count({
    where: { pageId: page.id },
  });
  if (existing === 0) {
    let order = 0;
    for (const text of ERSTI_STEPS) {
      await prisma.pageSection.create({
        data: { pageId: page.id, order: order++, kind: "STEP", body: text },
      });
    }
    for (const [question, answer] of ERSTI_FAQ) {
      await prisma.pageSection.create({
        data: {
          pageId: page.id,
          order: order++,
          kind: "FAQ",
          subtitle: question,
          body: `<p>${answer}</p>`,
        },
      });
    }
  }

  await prisma.erstiInfo.upsert({
    where: { id: "ersti" },
    update: {},
    create: { id: "ersti" },
  });

  console.log("Seeded Ersti-Info page");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
