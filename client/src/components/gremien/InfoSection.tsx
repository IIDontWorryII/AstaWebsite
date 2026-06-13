// client/src/components/gremien/InfoSection.tsx
//
// Renders an INFO section. Two layouts:
//   - Gremien (pass `textOnly` and optionally `logo`): heading with the
//     gremium logo to its right, then full-width body text. The group photo
//     lives in the hero, not here.
//   - Other pages (no flags): heading + the section image and body in a
//     2-column layout (also used by the admin preview).

import type { PageSectionDTO } from "../../../../shared/types";
import SectionHeader from "@/components/SectionHeader";

interface InfoSectionProps {
  section: PageSectionDTO;
  /** Heading shown above the block (e.g. "Über den AStA"). Default "Info". */
  title?: string;
  /** Alt text for the image (default "Team"). */
  altText?: string;
  /** Logo shown to the right of the heading. */
  logo?: string;
  /** Hide the section image (the photo lives in the hero instead). */
  textOnly?: boolean;
}

export default function InfoSection({
  section,
  title = "Info",
  altText = "Team",
  logo,
  textOnly,
}: InfoSectionProps) {
  const heading = (
    <div className="flex items-start justify-between gap-6">
      <SectionHeader title={title} />
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
  );

  const showImage = !!section.imageUrl && !textOnly && !logo;

  return (
    <div>
      {heading}
      {showImage ? (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <img
            src={section.imageUrl!}
            alt={altText}
            loading="lazy"
            decoding="async"
            className="rounded-2xl w-full shadow-sm"
          />
          <p className="text-gray-700 whitespace-pre-line leading-relaxed max-w-prose">
            {section.body}
          </p>
        </div>
      ) : (
        <p className="text-gray-700 whitespace-pre-line leading-relaxed max-w-prose">
          {section.body}
        </p>
      )}
    </div>
  );
}
