// client/src/components/gremien/MemberCard.tsx
//
// Renders one MEMBER section: an individual person's portrait card.
//   subtitle → role / function ("Präsident")
//   caption  → person's name ("Patrick Maas")
//
// Compact vertical card (same photo size as ReferatCard): circular photo
// on top, name + role centered underneath. The photo opens full-screen on
// click. Meant to sit in a centered flex-wrap row.

import { useState } from "react";
import type { PageSectionDTO } from "../../../../shared/types";
import ImageLightbox from "@/components/ImageLightbox";

interface MemberCardProps {
  section: PageSectionDTO;
}

export default function MemberCard({ section }: MemberCardProps) {
  const [zoom, setZoom] = useState<string | null>(null);

  return (
    <article className="flex flex-col items-center text-center w-48">
      {section.imageUrl && (
        <button
          type="button"
          onClick={() => setZoom(section.imageUrl)}
          className="cursor-pointer"
          aria-label="Foto vergrößern"
        >
          <img
            src={section.imageUrl}
            alt={section.caption ?? section.subtitle ?? "Mitglied"}
            loading="lazy"
            decoding="async"
            className="w-40 h-40 rounded-full object-cover hover:opacity-90 transition-opacity"
          />
        </button>
      )}
      {section.caption && (
        <p className="font-semibold mt-3">{section.caption}</p>
      )}
      {section.subtitle && (
        <p className="text-sm text-gray-600">{section.subtitle}</p>
      )}

      <ImageLightbox
        src={zoom}
        alt={section.caption ?? section.subtitle ?? "Mitglied"}
        onClose={() => setZoom(null)}
      />
    </article>
  );
}
