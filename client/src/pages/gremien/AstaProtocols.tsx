// components/pages/gremien/AstaProtocols.tsx

import { useEffect, useState } from "react";
import type { ProtocolDTO } from "../../../../shared/types";
import { fetchProtocols } from "../../lib/api";

export default function AstaProtocols() {
  const [protocols, setProtocols] = useState<ProtocolDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProtocols("ASTA")
      .then(setProtocols)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section id="protokolle" className="scroll-mt-20">
      <h2 className="text-3xl font-bold mb-6">Protokolle</h2>

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
                </div>
                <span aria-hidden className="text-2xl">
                  ↓
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
