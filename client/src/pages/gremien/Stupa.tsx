// client/src/pages/gremien/Stupa.tsx
//
// Public StuPa page. Info + Mitglieder fetched from the API; Protokolle
// stays unchanged.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../../shared/types";
import { fetchPage } from "@/lib/pages";
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
  // All members come from MEMBER sections, ordered by their `order` field
  // (the admin can reorder them). The first two — Präsident & Vize — go in
  // the top row; everyone after that wraps in the row below.
  const members = page.sections.filter((s) => s.kind === "MEMBER");
  const leadership = members.slice(0, 2);
  const rest = members.slice(2);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {info && <InfoSection section={info} altText="StuPa-Team" />}

      {members.length > 0 && (
        <section id="mitglieder" className="scroll-mt-20 space-y-10">
          <h2 className="text-2xl font-bold">Mitglieder</h2>

          {/* Top row: Präsident & Vizepräsident. */}
          <div className="flex flex-wrap justify-center gap-10">
            {leadership.map((m) => (
              <MemberCard key={m.id} section={m} />
            ))}
          </div>

          {/* Remaining members wrap across the rows below. */}
          {rest.length > 0 && (
            <div className="flex flex-wrap justify-center gap-10">
              {rest.map((m) => (
                <MemberCard key={m.id} section={m} />
              ))}
            </div>
          )}
        </section>
      )}

      <GremiumProtocols gremium="STUPA" />
    </div>
  );
}
