// client/src/pages/gremien/Stupa.tsx
//
// Public StuPa page: hero + bands (Info, Mitglieder, Protokolle). The first
// two MEMBER cards (Präsident & Vize) form the top row; the rest wrap below.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../../shared/types";
import { fetchPage } from "@/lib/pages";
import PageHero from "@/components/PageHero";
import Band from "@/components/Band";
import SectionHeader from "@/components/SectionHeader";
import InfoSection from "@/components/gremien/InfoSection";
import MemberCard from "@/components/gremien/MemberCard";
import GremiumProtocols from "./GremiumProtocols";

export default function Stupa() {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage("stupa")
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
  const members = page.sections.filter((s) => s.kind === "MEMBER");
  const leadership = members.slice(0, 2);
  const rest = members.slice(2);

  return (
    <div>
      <PageHero
        image={page.heroImageUrl ?? "/stupa-hero.webp"}
        title="StuPa"
        subtitle="Studierendenparlament"
      />

      {info && (
        <Band id="info">
          <InfoSection section={info} title="Über das StuPa" textOnly />
        </Band>
      )}

      {members.length > 0 && (
        <Band id="mitglieder" alt>
          <SectionHeader title="Mitglieder" />
          <div className="flex flex-wrap justify-center gap-10">
            {leadership.map((m) => (
              <MemberCard key={m.id} section={m} />
            ))}
          </div>
          {rest.length > 0 && (
            <div className="flex flex-wrap justify-center gap-10 mt-10">
              {rest.map((m) => (
                <MemberCard key={m.id} section={m} />
              ))}
            </div>
          )}
        </Band>
      )}

      <Band id="protokolle">
        <GremiumProtocols gremium="STUPA" />
      </Band>
    </div>
  );
}
