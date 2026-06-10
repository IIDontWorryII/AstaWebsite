// client/src/components/gremien/MenuCard.tsx
//
// Renders one MENU section: a single page of the drinks menu. The image is
// shown in full (object-contain) so the whole menu stays readable rather
// than being cropped. Optional caption sits underneath.

import type { PageSectionDTO } from "../../../../shared/types";

interface MenuCardProps {
  section: PageSectionDTO;
}

export default function MenuCard({ section }: MenuCardProps) {
  return (
    <figure className="flex flex-col">
      {section.imageUrl ? (
        <img
          src={section.imageUrl}
          alt={section.caption ?? "Getränkekarte"}
          loading="lazy"
          decoding="async"
          className="w-full rounded-lg border border-gray-200 object-contain bg-white"
        />
      ) : (
        <div className="w-full aspect-[3/4] rounded-lg border border-dashed border-gray-300 grid place-items-center text-sm text-gray-400">
          Noch kein Bild
        </div>
      )}
      {section.caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {section.caption}
        </figcaption>
      )}
    </figure>
  );
}
