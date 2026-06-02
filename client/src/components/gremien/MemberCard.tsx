// client/src/components/gremien/MemberCard.tsx
//
// Renders one MEMBER section: an individual person's portrait.
//   subtitle → role / function ("Präsident")
//   caption  → person's name ("Patrick Maas")
//   body     → optional short bio
//
// Visually distinct from ReferatCard: bigger circular portrait, name
// emphasized under the photo, role as a heading on the right.

import type { PageSectionDTO } from "../../../../shared/types";

interface MemberCardProps {
  section: PageSectionDTO;
}

export default function MemberCard({ section }: MemberCardProps) {
  return (
    <article className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
      <figure className="text-center">
        {section.imageUrl && (
          <img
            src={section.imageUrl}
            alt={section.caption ?? section.subtitle ?? "Mitglied"}
            className="w-48 h-48 rounded-full object-cover mx-auto"
          />
        )}
        {section.caption && (
          <figcaption className="font-semibold mt-2">
            {section.caption}
          </figcaption>
        )}
      </figure>
      <div>
        {section.subtitle && (
          <h3 className="text-xl font-bold mb-2">{section.subtitle}</h3>
        )}
        {section.body && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {section.body}
          </p>
        )}
      </div>
    </article>
  );
}
