// client/src/pages/gremien/Stupa.tsx
//
// Public StuPa page. Info + Mitglieder fetched from the API; Protokolle
// stays unchanged.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../../shared/types";
import { fetchPage } from "@/lib/pages";
import InfoSection from "@/components/gremien/InfoSection";
import MitgliederSection from "@/components/gremien/MitgliederSection";
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
  const mitglieder = page.sections.find((s) => s.kind === "MITGLIEDER");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {info && <InfoSection section={info} altText="StuPa-Team" />}

      {members.length > 0 && (
        <section id="praesidium" className="scroll-mt-20">
          <h2 className="text-2xl font-bold mb-6">Präsidium</h2>
          <div className="flex flex-wrap justify-center gap-10">
            {members.map((m) => (
              <MemberCard key={m.id} section={m} />
            ))}
          </div>
        </section>
      )}

      {mitglieder && <MitgliederSection section={mitglieder} />}
      <GremiumProtocols gremium="STUPA" />
    </div>
  );
}
