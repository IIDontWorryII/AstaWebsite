// client/src/components/gremien/InfoSection.tsx
//
// Renders an INFO section: a SectionHeader + image and body text in a
// 2-column layout (stacked on mobile). Content-only (the page wraps it in a
// <Band> that provides the background + anchor id), so it works both on the
// public pages and standalone in the admin editor.

import type { PageSectionDTO } from "../../../../shared/types";
import SectionHeader from "@/components/SectionHeader";

interface InfoSectionProps {
  section: PageSectionDTO;
  /** Heading shown above the block (e.g. "Über den AStA"). Default "Info". */
  title?: string;
  /** Alt text for the image (default "Team"). */
  altText?: string;
}

export default function InfoSection({
  section,
  title = "Info",
  altText = "Team",
}: InfoSectionProps) {
  return (
    <div>
      <SectionHeader title={title} />
      {section.imageUrl ? (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <img
            src={section.imageUrl}
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
