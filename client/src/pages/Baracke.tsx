// client/src/pages/Baracke.tsx
//
// Public BaRACke page. Content (info, opening hours, drinks menu, gallery)
// comes from the page-CMS under the "baracke" slug, so editors manage it
// via /admin/gremien/baracke. Upcoming events are pulled live from the
// Events API and filtered to those held at the BaRACke.

import { useEffect, useState } from "react";
import type { EventDTO, PageDTO } from "../../../shared/types";
import { fetchPage } from "@/lib/pages";
import { fetchEvents } from "@/lib/api";
import InfoSection from "@/components/gremien/InfoSection";
import MenuCard from "@/components/gremien/MenuCard";
import GalleryCard from "@/components/gremien/GalleryCard";

/** Matches event venues like "BaRACke", "Baracke Remagen", etc. */
function isBarackeEvent(place: string): boolean {
  return /bar.?cke/i.test(place);
}

export default function Baracke() {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage("baracke")
      .then(setPage)
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
    // Events are a nice-to-have; ignore failures so they don't blank the page.
    fetchEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
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

  const now = Date.now();
  const upcoming = events
    .filter((e) => isBarackeEvent(e.place) && new Date(e.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 3);

  return (
    <div>
      {/* Hero: interior photo + dark overlay + logo + tagline. */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="/Baracke-photo1.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-start text-white">
          <img
            src="/baracke-logo.png"
            alt="BaRACke"
            className="h-20 md:h-28 w-auto mb-4 drop-shadow-lg"
          />
          <p className="text-lg md:text-2xl font-medium max-w-xl drop-shadow">
            Die studentische Kneipe des RheinAhrCampus.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {info && <InfoSection section={info} altText="BaRACke" />}

        {/* Opening hours card. */}
        {hours && (hours.subtitle || hours.body) && (
          <section id="oeffnungszeiten" className="scroll-mt-20">
            <div className="inline-block rounded-lg border border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold mb-1">
                {hours.subtitle ?? "Öffnungszeiten"}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{hours.body}</p>
            </div>
          </section>
        )}

        {/* Drinks menu: two (or more) images side by side. */}
        {menu.length > 0 && (
          <section id="getraenkekarte" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">Getränkekarte</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {menu.map((m) => (
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

        {/* Upcoming events held at the BaRACke (live from the Events API). */}
        {upcoming.length > 0 && (
          <section id="events" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">Events in der BaRACke</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcoming.map((e) => (
                <article
                  key={e.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col"
                >
                  {e.imageUrl && (
                    <img
                      src={e.imageUrl}
                      alt={e.title}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold">{e.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(e.startsAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      Uhr
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
