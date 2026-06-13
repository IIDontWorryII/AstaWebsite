// client/src/components/GalleryCarousel.tsx
//
// Horizontal, scroll-snapping photo carousel with prev/next arrows. Clicking
// a photo opens it full-screen (ImageLightbox). Replaces the static photo
// grid on the BaRACke and Sport pages.

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageSectionDTO } from "../../../shared/types";
import ImageLightbox from "@/components/ImageLightbox";

interface GalleryCarouselProps {
  /** GALLERY sections; ones without an image are skipped. */
  items: PageSectionDTO[];
}

export default function GalleryCarousel({ items }: GalleryCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<string | null>(null);

  const photos = items.filter((i) => i.imageUrl);
  if (photos.length === 0) return null;

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-10 grid place-items-center h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white cursor-pointer";

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
      >
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setZoom(p.imageUrl)}
            className="snap-start shrink-0 w-64 md:w-80 cursor-pointer text-left"
          >
            <img
              src={p.imageUrl!}
              alt={p.caption ?? "Foto"}
              loading="lazy"
              decoding="async"
              className="w-full aspect-[4/3] object-cover rounded-lg hover:opacity-90 transition-opacity"
            />
            {p.caption && (
              <p className="text-xs text-gray-500 mt-1">{p.caption}</p>
            )}
          </button>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Vorherige Fotos"
            className={`${arrow} left-2`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Weitere Fotos"
            className={`${arrow} right-2`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <ImageLightbox src={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}
