// client/src/components/MenuCarousel.tsx
//
// Paged viewer for a multi-page document stored as image "pages" (MENU
// sections) — the BaRACke Getränkekarte and the Sport Sportprogramm. Shows
// one page at a time with prev/next arrows + a page counter, a download link
// for the current page, and click-to-zoom (ImageLightbox). Falls back to a
// plain single image when there's only one page.

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import type { PageSectionDTO } from "../../../shared/types";
import ImageLightbox from "@/components/ImageLightbox";

interface MenuCarouselProps {
  /** MENU sections, one per page; entries without an image are skipped. */
  sections: PageSectionDTO[];
  /** Used for alt text / the download filename (e.g. "Getränkekarte"). */
  label?: string;
}

export default function MenuCarousel({
  sections,
  label = "Datei",
}: MenuCarouselProps) {
  const pages = sections.filter((s) => s.imageUrl);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);

  if (pages.length === 0) return null;

  // Clamp so a shrunk list never points past the end.
  const index = Math.min(page, pages.length - 1);
  const current = pages[index];
  const multi = pages.length > 1;

  function go(delta: number) {
    setPage((p) => (p + delta + pages.length) % pages.length);
  }

  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-10 grid place-items-center h-10 w-10 rounded-full bg-white/90 shadow hover:bg-white cursor-pointer";

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setZoom(current.imageUrl!)}
          aria-label="Vergrößern"
          className="block w-full cursor-zoom-in"
        >
          <img
            src={current.imageUrl!}
            alt={current.caption ?? `${label} – Seite ${index + 1}`}
            loading="lazy"
            decoding="async"
            className="mx-auto max-h-[70vh] w-full rounded-lg border border-gray-200 bg-white object-contain"
          />
        </button>

        {multi && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Vorherige Seite"
              className={`${arrow} left-2`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Nächste Seite"
              className={`${arrow} right-2`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        {multi ? (
          <span className="text-sm text-gray-500">
            Seite {index + 1} / {pages.length}
          </span>
        ) : (
          <span />
        )}
        <a
          href={current.imageUrl!}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-asta-red hover:text-asta-red-dark"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Herunterladen
        </a>
      </div>

      <ImageLightbox src={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}
