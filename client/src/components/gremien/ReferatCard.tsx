// client/src/components/gremien/ReferatCard.tsx
//
// One REFERAT, styled per the design concept: a rounded card with the role +
// description on the left, and a portrait "person card" (photo, role, name,
// contact) on the right. Content-only — the page lays these out in a grid.
//
//   subtitle → role / Referat name ("Vorsitz")
//   body     → description
//   caption  → holder's name
//   email    → contact

import { useState } from "react";
import { Mail, Users } from "lucide-react";
import type { PageSectionDTO } from "../../../../shared/types";
import ImageLightbox from "@/components/ImageLightbox";

interface ReferatCardProps {
  section: PageSectionDTO;
}

export default function ReferatCard({ section }: ReferatCardProps) {
  const [zoom, setZoom] = useState<string | null>(null);
  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8 grid md:grid-cols-[1fr_260px] gap-8 items-start">
      {/* Left: role + description */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="grid place-items-center h-8 w-8 rounded-full bg-asta-red text-white shrink-0">
            <Users className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-bold uppercase tracking-wide text-asta-red">
            {section.subtitle}
          </h3>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line max-w-prose">
          {section.body}
        </p>
      </div>

      {/* Right: portrait person card */}
      <div className="rounded-xl border border-gray-200 p-5 text-center">
        {section.imageUrl ? (
          <button
            type="button"
            onClick={() => setZoom(section.imageUrl)}
            className="block mx-auto cursor-pointer"
            aria-label="Foto vergrößern"
          >
            <img
              src={section.imageUrl}
              alt={section.caption ?? section.subtitle ?? "Referat"}
              loading="lazy"
              decoding="async"
              className="w-28 h-28 rounded-full object-cover hover:opacity-90 transition-opacity"
            />
          </button>
        ) : (
          <div className="w-28 h-28 rounded-full bg-asta-red/10 mx-auto" aria-hidden />
        )}
        {section.subtitle && (
          <p className="text-asta-red font-semibold uppercase text-xs tracking-wide mt-3">
            {section.subtitle}
          </p>
        )}
        {section.caption && (
          <p className="text-lg font-bold leading-tight">{section.caption}</p>
        )}
        {section.email && (
          <a
            href={`mailto:${section.email}`}
            aria-label={`E-Mail an ${section.caption ?? section.subtitle ?? "Referat"}`}
            className="inline-flex items-center justify-center gap-1 mt-3 text-sm text-gray-600 hover:text-asta-red"
          >
            <Mail className="h-4 w-4" />
            E-Mail
          </a>
        )}
      </div>

      <ImageLightbox
        src={zoom}
        alt={section.caption ?? section.subtitle ?? "Referat"}
        onClose={() => setZoom(null)}
      />
    </article>
  );
}
