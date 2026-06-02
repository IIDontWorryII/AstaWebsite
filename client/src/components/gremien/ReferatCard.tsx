// client/src/components/gremien/ReferatCard.tsx
//
// Renders one REFERAT section: text on the left, portrait photo + holder
// caption on the right. Same layout the original hardcoded Asta.tsx used.

import type { PageSectionDTO } from "../../../../shared/types";

interface ReferatCardProps {
  section: PageSectionDTO;
}

export default function ReferatCard({ section }: ReferatCardProps) {
  return (
    <article className="grid md:grid-cols-[1fr_200px] gap-8 items-start">
      <div>
        <h3 className="text-xl font-bold mb-3">{section.subtitle ?? ""}:</h3>
        <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
          {section.body}
        </p>
        {section.email && (
          <p className="text-sm">
            <span className="font-semibold underline">Email:</span>{" "}
            <a
              href={`mailto:${section.email}`}
              className="hover:text-asta-red"
            >
              {section.email}
            </a>
          </p>
        )}
      </div>
      {section.imageUrl && (
        <figure className="text-center">
          <img
            src={section.imageUrl}
            alt={section.caption ?? section.subtitle ?? "Referat"}
            className="w-40 h-40 rounded-full object-cover mx-auto"
          />
          {(section.subtitle || section.caption) && (
            <figcaption className="italic mt-2 text-sm">
              {section.subtitle}
              {section.subtitle && section.caption ? ": " : ""}
              {section.caption}
            </figcaption>
          )}
        </figure>
      )}
    </article>
  );
}
