// client/src/components/gremien/GalleryCard.tsx
//
// Renders one GALLERY section: a single photo cropped to a square tile
// (object-cover) so a row of them lines up cleanly in the gallery grid.

import type { PageSectionDTO } from "../../../../shared/types";

interface GalleryCardProps {
  section: PageSectionDTO;
}

export default function GalleryCard({ section }: GalleryCardProps) {
  return (
    <figure>
      {section.imageUrl ? (
        <img
          src={section.imageUrl}
          alt={section.caption ?? "Foto"}
          loading="lazy"
          decoding="async"
          className="w-full aspect-square rounded-lg object-cover"
        />
      ) : (
        <div className="w-full aspect-square rounded-lg border border-dashed border-gray-300 grid place-items-center text-sm text-gray-400">
          Noch kein Bild
        </div>
      )}
      {section.caption && (
        <figcaption className="text-xs text-gray-500 mt-1 text-center">
          {section.caption}
        </figcaption>
      )}
    </figure>
  );
}
