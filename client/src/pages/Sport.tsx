// client/src/pages/Sport.tsx
//
// Public Sport page. Same shape as BaRACke: hero + info + upcoming events
// (filtered to SPORT) + Sportprogramm (MENU images) + photo gallery.
// Content comes from the page-CMS "sport" slug, edited via /admin/gremien/sport.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../shared/types";
import { fetchPage } from "@/lib/pages";
import InfoSection from "@/components/gremien/InfoSection";
import MenuCard from "@/components/gremien/MenuCard";
import GalleryCard from "@/components/gremien/GalleryCard";
import UpcomingEvents from "@/components/UpcomingEvents";

// Placeholder hero image until a dedicated sport photo is added to
// client/public — swap this path for the real one.
const HERO_IMAGE = "/campus-photo.jpg";

export default function Sport() {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage("sport")
      .then(setPage)
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-red-600">Fehler: {error}</p>
      </div>
    );
  }
  if (!page) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-gray-500">Lädt…</p>
      </div>
    );
  }

  const info = page.sections.find((s) => s.kind === "INFO");
  const program = page.sections.filter((s) => s.kind === "MENU");
  const gallery = page.sections.filter((s) => s.kind === "GALLERY");

  return (
    <div>
      {/* Hero: photo background + dark overlay + title. */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-start text-white">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            {page.title}
          </h1>
          <p className="text-lg md:text-2xl font-medium max-w-xl mt-3 drop-shadow">
            Hochschulsport am RheinAhrCampus.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {info && <InfoSection section={info} altText="Sport" />}

        {/* Next 3 sport events with live countdown. */}
        <UpcomingEvents category="SPORT" title="Bevorstehende Sport-Events" />

        {/* Sportprogramm: schedule images side by side. */}
        {program.length > 0 && (
          <section id="sportprogramm" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">Sportprogramm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {program.map((m) => (
                <MenuCard key={m.id} section={m} />
              ))}
            </div>
          </section>
        )}

        {/* Photo gallery. */}
        {gallery.length > 0 && (
          <section id="galerie" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">Galerie</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((g) => (
                <GalleryCard key={g.id} section={g} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
