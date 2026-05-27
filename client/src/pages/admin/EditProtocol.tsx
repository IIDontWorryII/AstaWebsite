// client/src/pages/admin/EditProtocol.tsx
//
// Wrapper around ProtocolForm in "edit" mode. Loads the protocol by URL
// param on mount, then renders the form pre-populated. Same three-state
// pattern as EditEvent: undefined (loading) / null (not found) / DTO (found).

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ProtocolDTO } from "../../../../shared/types";
import { fetchProtocolById } from "@/lib/admin-protocols";
import ProtocolForm from "./ProtocolForm";

export default function EditProtocol() {
  const { id } = useParams<{ id: string }>();

  const [protocol, setProtocol] = useState<ProtocolDTO | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchProtocolById(id)
      .then((p) => setProtocol(p))
      .catch((err) => setError(err instanceof Error ? err.message : "Fehler"));
  }, [id]);

  if (error) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-red-600">Fehler: {error}</p>
        <Link to="/admin/protocols" className="text-asta-red hover:underline">
          Zurück zur Liste
        </Link>
      </section>
    );
  }

  if (protocol === undefined) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-gray-500">Lädt…</p>
      </section>
    );
  }

  if (protocol === null) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Protokoll nicht gefunden</h1>
        <Link to="/admin/protocols" className="text-asta-red hover:underline">
          Zurück zur Liste
        </Link>
      </section>
    );
  }

  return <ProtocolForm protocol={protocol} />;
}
