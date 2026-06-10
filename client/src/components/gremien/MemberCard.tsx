// client/src/components/gremien/MemberCard.tsx
//
// Renders one MEMBER section: an individual person's portrait card.
//   subtitle → role / function ("Präsident")
//   caption  → person's name ("Patrick Maas")
//
// Compact vertical card (same photo size as ReferatCard): circular photo
// on top, name + role centered underneath. Meant to sit in a centered
// flex-wrap row so several members line up side by side.

import type { PageSectionDTO } from "../../../../shared/types";

interface MemberCardProps {
  section: PageSectionDTO;
}

export default function MemberCard({ section }: MemberCardProps) {
  return (
    <article className="flex flex-col items-center text-center w-48">
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.caption ?? section.subtitle ?? "Mitglied"}
          loading="lazy"
          decoding="async"
          className="w-40 h-40 rounded-full object-cover"
        />
      )}
      {section.caption && (
        <p className="font-semibold mt-3">{section.caption}</p>
      )}
      {section.subtitle && (
        <p className="text-sm text-gray-600">{section.subtitle}</p>
      )}
    </article>
  );
}
