// client/src/pages/Baracke.tsx
//
// Public BaRACke page: hero + alternating bands (info, opening hours, events,
// drinks menu, gallery). Content comes from the page-CMS "baracke" slug.

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { PageDTO } from "../../../shared/types";
import { fetchPage } from "@/lib/pages";
import PageHero from "@/components/PageHero";
import Band from "@/components/Band";
import SectionHeader from "@/components/SectionHeader";
import InfoSection from "@/components/gremien/InfoSection";
import MenuCard from "@/components/gremien/MenuCard";
import GalleryCard from "@/components/gremien/GalleryCard";
import UpcomingEvents from "@/components/UpcomingEvents";

export default function Baracke() {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage("baracke")
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
  const hours = page.sections.find((s) => s.kind === "FREEFORM");
  const menu = page.sections.filter((s) => s.kind === "MENU");
  const gallery = page.sections.filter((s) => s.kind === "GALLERY");

  return (
    <div>
      <PageHero
        image={page.heroImageUrl ?? "/Baracke-photo1.jpg"}
        title="BaRACke"
        subtitle="Die studentische Kneipe des RheinAhrCampus"
      />

      {info && (
        <Band id="info">
          <InfoSection section={info} title="Über die BaRACke" altText="BaRACke" />
        </Band>
      )}

      {hours && (hours.subtitle || hours.body) && (
        <Band id="oeffnungszeiten" alt>
          <SectionHeader title={hours.subtitle ?? "Öffnungszeiten"} />
          <div className="inline-flex items-center gap-4 rounded-2xl border border-gray-200 bg-white shadow-sm px-6 py-5">
            <span className="grid place-items-center h-12 w-12 rounded-full bg-asta-red/10 text-asta-red shrink-0">
              <Clock className="h-6 w-6" />
            </span>
            <p className="text-gray-700 whitespace-pre-line">{hours.body}</p>
          </div>
        </Band>
      )}

      <Band id="events">
        <UpcomingEvents category="BARACKE" title="Events in der BaRACke" />
      </Band>

      {menu.length > 0 && (
        <Band id="getraenkekarte" alt>
          <SectionHeader title="Getränkekarte" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {menu.map((m) => (
              <MenuCard key={m.id} section={m} />
            ))}
          </div>
        </Band>
      )}

      {gallery.length > 0 && (
        <Band id="galerie">
          <SectionHeader title="Galerie" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <GalleryCard key={g.id} section={g} />
            ))}
          </div>
        </Band>
      )}
    </div>
  );
}
