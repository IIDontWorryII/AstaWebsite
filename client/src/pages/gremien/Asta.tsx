// client/src/pages/gremien/Asta.tsx
//
// Public AStA page. All content (Info + Referate) is now fetched from the
// API and rendered via the shared section components. Protocols come from
// GremiumProtocols as before.
//
// The admin can edit each section via /admin/gremien/asta — that page
// reuses the same section components.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../../shared/types";
import { fetchPage } from "@/lib/pages";
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

  // Sections come back ordered. We split them by kind for layout purposes:
  // the single INFO at the top, then all REFERATs in a list below.
  const info = page.sections.find((s) => s.kind === "INFO");
  const referate = page.sections.filter((s) => s.kind === "REFERAT");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <h1 className="text-4xl font-bold">{page.title}</h1>

      {info && <InfoSection section={info} altText="AStA-Team" />}

      <section id="referate" className="scroll-mt-20">
        <h2 className="text-3xl font-bold mb-2">ASTA-Referate</h2>
        <p className="text-gray-600 mb-10">
          Hier stellen sich alle Referate des AStA-Remagen vor und erklären ihre
          jeweiligen Aufgaben:
        </p>
        <div className="space-y-12">
          {referate.map((r) => (
            <ReferatCard key={r.id} section={r} />
          ))}
        </div>
      </section>

      <GremiumProtocols gremium="ASTA" />
    </div>
  );
}
