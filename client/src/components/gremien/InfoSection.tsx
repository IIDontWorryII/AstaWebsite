// client/src/components/gremien/InfoSection.tsx
//
// Renders an INFO section: image + body paragraph in a 2-column grid on
// md+ screens, stacked on mobile. The admin layer can wrap this in an
// EditableSection without changing this component.

import type { PageSectionDTO } from "../../../../shared/types";

interface InfoSectionProps {
  section: PageSectionDTO;
  /** Used as a route anchor (default: "info"). */
  anchorId?: string;
  /** Used in the alt text (default: "Team"). */
  altText?: string;
}

export default function InfoSection({
  section,
  anchorId = "info",
  altText = "Team",
}: InfoSectionProps) {
  return (
    <section id={anchorId} className="scroll-mt-20">
      <h2 className="text-2xl font-bold mb-4">Info</h2>
      {section.imageUrl ? (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <img
            src={section.imageUrl}
            alt={altText}
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
