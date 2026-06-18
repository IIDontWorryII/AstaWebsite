// server/prisma/migrate-richtext.ts
//
// One-time data migration for the rich-text feature (AW-60).
//
// Before this feature, Event.description and PageSection.body held plain text.
// They now hold sanitized HTML produced by the TipTap editor and rendered with
// dangerouslySetInnerHTML. This script converts any legacy plain-text values to
// HTML so old content keeps its paragraph/line breaks instead of collapsing.
//
// Safe to run more than once: rows that already contain editor HTML are
// detected (looksLikeHtml) and skipped, so a second run is a no-op. Run with:
//
//   npm run migrate:richtext            # apply
//   npm run migrate:richtext -- --dry   # preview, write nothing

import { PrismaClient } from "@prisma/client";
import { looksLikeHtml, plainTextToHtml } from "../html/plainTextToHtml.js";
import { sanitizeRichText } from "../html/sanitize.js";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry");

/** Convert one legacy value, or return null if it needs no migration. */
function migrateValue(current: string | null): string | null {
  if (current == null) return null;
  if (current.trim() === "") return null; // leave empties alone
  if (looksLikeHtml(current)) return null; // already HTML — skip
  // Build paragraphs, then run through the same sanitizer the write paths use.
  return sanitizeRichText(plainTextToHtml(current));
}

async function main() {
  console.log(
    DRY_RUN
      ? "Rich-text migration (DRY RUN — no writes)\n"
      : "Rich-text migration (applying changes)\n",
  );

  // --- Event.description (required String) ---
  const events = await prisma.event.findMany({
    select: { id: true, title: true, description: true },
  });
  let eventsChanged = 0;
  for (const e of events) {
    const next = migrateValue(e.description);
    if (next == null) continue;
    eventsChanged++;
    console.log(`  Event "${e.title}" (${e.id})`);
    console.log(`    - ${JSON.stringify(e.description)}`);
    console.log(`    + ${JSON.stringify(next)}`);
    if (!DRY_RUN) {
      await prisma.event.update({
        where: { id: e.id },
        data: { description: next },
      });
    }
  }

  // --- PageSection.body (optional String) ---
  const sections = await prisma.pageSection.findMany({
    select: { id: true, kind: true, subtitle: true, body: true },
  });
  let sectionsChanged = 0;
  for (const s of sections) {
    const next = migrateValue(s.body);
    if (next == null) continue;
    sectionsChanged++;
    console.log(`  PageSection ${s.kind} "${s.subtitle ?? ""}" (${s.id})`);
    console.log(`    - ${JSON.stringify(s.body)}`);
    console.log(`    + ${JSON.stringify(next)}`);
    if (!DRY_RUN) {
      await prisma.pageSection.update({
        where: { id: s.id },
        data: { body: next },
      });
    }
  }

  console.log(
    `\nDone. Events ${DRY_RUN ? "to migrate" : "migrated"}: ${eventsChanged}/${events.length}; ` +
      `page sections ${DRY_RUN ? "to migrate" : "migrated"}: ${sectionsChanged}/${sections.length}.`,
  );
  if (DRY_RUN) console.log("Dry run — nothing was written.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
