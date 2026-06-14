// client/src/components/gremien/FreeformSection.tsx
//
// Generic heading + body (+ optional image and logo) block. Used by
// Fachschaften for MIT / WiSo. The heading shows the Fachschaft logo to its
// right; below it the photo and text sit in a 2-column layout whose image
// side alternates (`imageRight`) so stacked sections don't look identical.
// Content-only — the page wraps it in a <Band> with the anchor id.

import type { ReactNode } from "react";
import type { PageSectionDTO } from "../../../../shared/types";
import SectionHeader from "@/components/SectionHeader";

interface FreeformSectionProps {
  section: PageSectionDTO;
  /** Put the second column (image/aside) on the right (alternate per section). */
  imageRight?: boolean;
  /** Logo shown to the right of the heading. */
  logo?: string;
  /**
   * Custom content for the second column (e.g. member cards). When provided it
   * replaces the section image, so the band alternates text ⇄ members.
   */
  aside?: ReactNode;
}

export default function FreeformSection({
  section,
  imageRight = false,
  logo,
  aside,
}: FreeformSectionProps) {
  const text = (
    <p className="text-gray-700 whitespace-pre-line leading-relaxed max-w-prose">
      {section.body}
    </p>
  );

  const image = section.imageUrl ? (
    <img
      src={section.imageUrl}
      alt={section.subtitle ?? "Fachschaft"}
      loading="lazy"
      decoding="async"
      className="rounded-2xl w-full shadow-sm"
    />
  ) : null;

  // An explicit aside (member cards) wins over the section image.
  const side = aside ?? image;

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <SectionHeader title={section.subtitle ?? ""} />
        {logo && (
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="h-16 md:h-20 w-auto shrink-0"
          />
        )}
      </div>

      {side ? (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {imageRight ? (
            <>
              {text}
              {side}
            </>
          ) : (
            <>
              {side}
              {text}
            </>
          )}
        </div>
      ) : (
        text
      )}
    </div>
  );
}
