// client/src/pages/gremien/Fachschaften.tsx
//
// Public Fachschaften page. Info + freeform MIT / WiSo sections fetched
// from the API.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../../shared/types";
import { fetchPage } from "@/lib/pages";
import InfoSection from "@/components/gremien/InfoSection";
import FreeformSection from "@/components/gremien/FreeformSection";

export default function Fachschaften() {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage("fachschaften")
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
  const freeforms = page.sections.filter((s) => s.kind === "FREEFORM");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {info && <InfoSection section={info} />}
      {freeforms.map((s) => (
        <FreeformSection key={s.id} section={s} />
      ))}
    </div>
  );
}
