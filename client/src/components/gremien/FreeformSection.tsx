// client/src/components/gremien/FreeformSection.tsx
//
// Generic heading + body (+ optional image and logo) block. Used by
// Fachschaften for MIT / WiSo. Content-only — the page wraps it in a <Band>
// that carries the background and the anchor id (#mit / #wiso). The image
// side alternates via `imageRight` so stacked sections don't look identical.

import type { PageSectionDTO } from "../../../../shared/types";
import SectionHeader from "@/components/SectionHeader";

interface FreeformSectionProps {
  section: PageSectionDTO;
  /** Put the image on the right (alternate per section). */
  imageRight?: boolean;
  /** Optional logo shown above the text. */
  logo?: string;
}

export default function FreeformSection({
  section,
  imageRight = false,
  logo,
}: FreeformSectionProps) {
  const text = (
    <div className="max-w-prose">
      {logo && (
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-14 w-auto mb-4"
        />
      )}
      <SectionHeader title={section.subtitle ?? ""} />
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
        {section.body}
      </p>
    </div>
  );

  if (!section.imageUrl) return text;

  const image = (
    <img
      src={section.imageUrl}
      alt={section.subtitle ?? "Fachschaft"}
      loading="lazy"
      decoding="async"
      className="rounded-2xl w-full shadow-sm"
    />
  );

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      {imageRight ? (
        <>
          {text}
          {image}
        </>
      ) : (
        <>
          {image}
          {text}
        </>
      )}
    </div>
  );
}
