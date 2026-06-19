// client/src/pages/Sport.tsx
//
// Public Sport page: hero + bands (info, events, Sportprogramm, gallery).
// Content comes from the page-CMS "sport" slug.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../shared/types";
import { fetchPage } from "@/lib/pages";
import PageHero from "@/components/PageHero";
import Band from "@/components/Band";
import SectionHeader from "@/components/SectionHeader";
import InfoSection from "@/components/gremien/InfoSection";
import MenuCarousel from "@/components/MenuCarousel";
import GalleryCarousel from "@/components/GalleryCarousel";
import UpcomingEvents from "@/components/UpcomingEvents";

// Placeholder hero until a dedicated sport photo is added to client/public.
const HERO_IMAGE = "/sport-hero.webp";

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
      <PageHero
        image={page.heroImageUrl ?? HERO_IMAGE}
        title="Sport"
        subtitle="Hochschulsport am RheinAhrCampus"
      />

      {info && (
        <Band id="info">
          <InfoSection
            section={info}
            title="Über den Hochschulsport"
            altText="Sport"
          />
        </Band>
      )}

      {/* Events and the Sportprogramm sit side-by-side: events left, the
          program page carousel right. When there's no program, events go
          full-width. */}
      <Band id="events" alt>
        {program.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <UpcomingEvents
                category="SPORT"
                title="Bevorstehende Sport-Events"
              />
            </div>
            <div id="sportprogramm">
              <SectionHeader title="Sportprogramm" />
              <MenuCarousel sections={program} label="Sportprogramm" />
            </div>
          </div>
        ) : (
          <UpcomingEvents category="SPORT" title="Bevorstehende Sport-Events" />
        )}
      </Band>

      {gallery.length > 0 && (
        <Band id="galerie" alt>
          <SectionHeader title="Galerie" />
          <GalleryCarousel items={gallery} />
        </Band>
      )}
    </div>
  );
}
