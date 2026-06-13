// client/src/pages/Baracke.tsx
//
// Public BaRACke page: hero + bands (info, contact bar, events, drinks menu,
// gallery carousel). Content comes from the page-CMS "baracke" slug; the
// contact details are static (rarely change).

import { useEffect, useState, type ComponentType } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { PageDTO } from "../../../shared/types";
import { fetchPage } from "@/lib/pages";
import PageHero from "@/components/PageHero";
import Band from "@/components/Band";
import SectionHeader from "@/components/SectionHeader";
import InfoSection from "@/components/gremien/InfoSection";
import MenuCard from "@/components/gremien/MenuCard";
import GalleryCarousel from "@/components/GalleryCarousel";
import UpcomingEvents from "@/components/UpcomingEvents";

const LOCATION = "Maisons-Laffitte-Platz 4, 53424 Remagen";
const EMAIL = "rac-asta-baracke@rheinahrcampus.de";
const PHONE_DISPLAY = "+49 176 86665388";
const PHONE_HREF = "tel:+4917686665388";

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <div className="flex items-start gap-3">
      <span className="grid place-items-center h-10 w-10 rounded-full bg-asta-red/10 text-asta-red shrink-0">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="text-gray-800 whitespace-pre-line">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="hover:text-asta-red">
      {body}
    </a>
  ) : (
    body
  );
}

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

      {/* Contact bar: opening hours + location + email + phone in one row. */}
      <Band id="oeffnungszeiten" alt>
        <SectionHeader title="Öffnungszeiten & Kontakt" />
        <div className="flex flex-wrap gap-x-10 gap-y-6">
          <ContactItem
            icon={Clock}
            label="Öffnungszeiten"
            value={hours?.body || "Während der Vorlesungszeit"}
          />
          <ContactItem icon={MapPin} label="Ort" value={LOCATION} />
          <ContactItem
            icon={Mail}
            label="E-Mail"
            value={EMAIL}
            href={`mailto:${EMAIL}`}
          />
          <ContactItem
            icon={Phone}
            label="Telefon"
            value={PHONE_DISPLAY}
            href={PHONE_HREF}
          />
        </div>
      </Band>

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
          <GalleryCarousel items={gallery} />
        </Band>
      )}
    </div>
  );
}
