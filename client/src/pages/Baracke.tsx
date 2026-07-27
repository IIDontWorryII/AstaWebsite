// client/src/pages/Baracke.tsx
//
// Public BaRACke page: hero + bands (info, contact bar, events, drinks menu,
// gallery carousel). Content comes from the page-CMS "baracke" slug; the
// contact details are static (rarely change).

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { PageDTO } from "../../../shared/types";
import { fetchPage } from "@/lib/pages";
import PageHero from "@/components/PageHero";
import Band from "@/components/Band";
import SectionHeader from "@/components/SectionHeader";
import InfoSection from "@/components/gremien/InfoSection";
import RichText from "@/components/RichText";
import MenuCarousel from "@/components/MenuCarousel";
import GalleryCarousel from "@/components/GalleryCarousel";
import UpcomingEvents from "@/components/UpcomingEvents";
import ObfuscatedMailLink from "@/components/ObfuscatedMailLink";

const LOCATION = "Maisons-Laffitte-Platz 4, 53424 Remagen";
const EMAIL_USER = "rac-asta-baracke";
const EMAIL_DOMAIN = "rheinahrcampus.de";
const PHONE_DISPLAY = "+49 176 86665388";
const PHONE_HREF = "tel:+4917686665388";

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  html,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  href?: string;
  /** Render `value` as rich-text HTML (used for the editor-managed hours). */
  html?: boolean;
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
        {html ? (
          <RichText
            html={value as string}
            className="prose-sm prose-p:my-0 text-gray-800"
          />
        ) : (
          <p className="text-gray-800 whitespace-pre-line">{value}</p>
        )}
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

      {/* "Über die BaRACke" text and the opening hours + contact details share
          one band under the hero: intro on the left, contact column on the right. */}
      <Band id="info">
        <div
          className={
            info ? "grid lg:grid-cols-5 gap-10 lg:gap-16 items-start" : ""
          }
        >
          {info && (
            // Wider intro column (3/5) so the text has room; the contact
            // column (2/5) sits to the right with an even outer margin.
            <div className="lg:col-span-3">
              <InfoSection
                section={info}
                title="Über die BaRACke"
                altText="BaRACke"
                textOnly
              />
            </div>
          )}
          <div id="oeffnungszeiten" className="lg:col-span-2">
            <SectionHeader title="Öffnungszeiten & Kontakt" />
            <div className="space-y-5">
              <ContactItem
                icon={Clock}
                label="Öffnungszeiten"
                value={hours?.body || "<p>Während der Vorlesungszeit</p>"}
                html
              />
              <ContactItem icon={MapPin} label="Ort" value={LOCATION} />
              <ContactItem
                icon={Mail}
                label="E-Mail"
                value={
                  <ObfuscatedMailLink
                    user={EMAIL_USER}
                    domain={EMAIL_DOMAIN}
                    className="hover:text-asta-red"
                  />
                }
              />
              <ContactItem
                icon={Phone}
                label="Telefon"
                value={PHONE_DISPLAY}
                href={PHONE_HREF}
              />
            </div>
          </div>
        </div>
      </Band>

      {/* Events and the Getränkekarte sit side-by-side: events left, the
          drinks-menu page carousel right. When there's no menu, events go
          full-width. */}
      <Band id="events">
        {menu.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <UpcomingEvents category="BARACKE" title="Events in der BaRACke" />
            </div>
            <div id="getraenkekarte">
              <SectionHeader title="Getränkekarte" />
              <MenuCarousel sections={menu} label="Getränkekarte" />
            </div>
          </div>
        ) : (
          <UpcomingEvents category="BARACKE" title="Events in der BaRACke" />
        )}
      </Band>

      {gallery.length > 0 && (
        <Band id="galerie">
          <SectionHeader title="Galerie" />
          <GalleryCarousel items={gallery} />
        </Band>
      )}
    </div>
  );
}
