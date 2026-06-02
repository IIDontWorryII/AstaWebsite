// client/src/components/gremien/MitgliederSection.tsx
//
// Renders STUPA's "Mitglieder" section: image on top, body (member names)
// below. Subtitle from the section becomes the heading.

import type { PageSectionDTO } from "../../../../shared/types";

interface MitgliederSectionProps {
  section: PageSectionDTO;
  anchorId?: string;
}

export default function MitgliederSection({
  section,
  anchorId = "mitglieder",
}: MitgliederSectionProps) {
  return (
    <section id={anchorId} className="scroll-mt-20">
      <h2 className="text-2xl font-bold mb-4">
        {section.subtitle ?? "Mitglieder"}
      </h2>
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.subtitle ?? "Mitglieder"}
          className="rounded-lg w-full mb-4"
        />
      )}
      <p className="text-gray-700 whitespace-pre-line">{section.body}</p>
    </section>
  );
}
