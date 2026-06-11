// client/src/pages/gremien/GremiumProtocols.tsx
//
// Renders the "Protokolle" section for any Gremium. Pass the gremium name
// as a prop; the component fetches /api/protocols?gremium=<name> and renders
// loading / error / list states.
//
// Used by Asta.tsx (gremium="ASTA") and Stupa.tsx (gremium="STUPA").

import { useEffect, useState } from "react";
import type { ProtocolDTO } from "../../../../shared/types";
import { fetchProtocols } from "@/lib/api";
import SectionHeader from "@/components/SectionHeader";

interface GremiumProtocolsProps {
  /** Which gremium's protocols to load — sent as the ?gremium= query param. */
  gremium: string;
}

export default function GremiumProtocols({ gremium }: GremiumProtocolsProps) {
  const [protocols, setProtocols] = useState<ProtocolDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when the gremium prop changes so the new fetch starts
    // from a clean loading state instead of showing stale data.
    setProtocols(null);
    setError(null);

    fetchProtocols(gremium)
      .then(setProtocols)
      .catch((e) => setError(e.message));
  }, [gremium]);

  return (
    <div>
      <SectionHeader title="Protokolle" />

      {error ? (
        <p className="text-red-600">Fehler: {error}</p>
      ) : protocols === null ? (
        <p className="text-gray-500">Lädt…</p>
      ) : (
        <ul className="space-y-3">
          {protocols.map((p) => (
            <li key={p.id}>
              <a
                href={p.fileUrl}
                download
                className="flex items-center justify-between gap-4 p-4
                           border border-gray-200 rounded-lg
                           hover:border-asta-red hover:bg-asta-red hover:text-white
                           transition-colors"
              >
                <div>
                  <p className="font-semibold">
                    {new Date(p.meetingDate).toLocaleDateString("de-DE")}
                  </p>
                  <p className="text-sm opacity-80">{p.title}</p>
                  {p.description && (
                    <p className="text-sm opacity-70 mt-1 whitespace-pre-line">
                      {p.description}
                    </p>
                  )}
                </div>
                <span aria-hidden className="text-2xl">
                  ↓
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
