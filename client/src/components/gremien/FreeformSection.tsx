// client/src/components/gremien/FreeformSection.tsx
//
// Generic subtitle + body section. Used by Fachschaften for MIT / WiSo.
// anchorId is derived from a slug-friendly version of the subtitle so
// the existing hash-based navigation (e.g. /gremien/fachschaften#wiso)
// keeps working.

import type { PageSectionDTO } from "../../../../shared/types";

interface FreeformSectionProps {
  section: PageSectionDTO;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function FreeformSection({ section }: FreeformSectionProps) {
  const anchorId = section.subtitle ? slugify(section.subtitle) : section.id;
  return (
    <section id={anchorId} className="scroll-mt-20">
      <h2 className="text-2xl font-bold mb-4">{section.subtitle ?? ""}</h2>
      {section.imageUrl ? (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <img
            src={section.imageUrl}
            alt={section.subtitle ?? "Fachschaft"}
            className="rounded-lg w-full"
          />
          <p className="text-gray-700 whitespace-pre-line">{section.body}</p>
        </div>
      ) : (
        <p className="text-gray-700 whitespace-pre-line">{section.body}</p>
      )}
    </section>
  );
}
