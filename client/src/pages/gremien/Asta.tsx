// client/src/pages/gremien/Asta.tsx
//
// Public AStA page: hero + alternating bands (Info, Referate, Protokolle).
// Content is fetched from the API and rendered via the shared section
// components; the admin edits the same sections via /admin/gremien/asta.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../../shared/types";
import { fetchPage } from "@/lib/pages";
import PageHero from "@/components/PageHero";
import Band from "@/components/Band";
import SectionHeader from "@/components/SectionHeader";
import InfoSection from "@/components/gremien/InfoSection";
import ReferatCard from "@/components/gremien/ReferatCard";
import GremiumProtocols from "./GremiumProtocols";

export default function Asta() {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage("asta")
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
  const referate = page.sections.filter((s) => s.kind === "REFERAT");

  return (
    <div>
      <PageHero
        image={page.heroImageUrl ?? "/asta-hero.webp"}
        title="AStA"
        subtitle="Allgemeiner Studierendenausschuss"
      />

      {info && (
        <Band id="info">
          <InfoSection
            section={info}
            title="Über den AStA"
            logo="/asta-logo.png"
            textOnly
          />
        </Band>
      )}

      <Band id="referate" alt>
        <SectionHeader
          title="Referate"
          subtitle="Hier stellen sich alle Referate des AStA Remagen vor und erklären ihre jeweiligen Aufgaben."
        />
        <div className="space-y-6">
          {referate.map((r) => (
            <ReferatCard key={r.id} section={r} />
          ))}
        </div>
      </Band>

      <Band id="protokolle">
        <GremiumProtocols gremium="ASTA" />
      </Band>
    </div>
  );
}
