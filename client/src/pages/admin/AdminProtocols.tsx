// client/src/pages/admin/AdminProtocols.tsx
//
// EDITOR-only list view for managing protocols. Mirrors AdminEvents:
// loading/error/empty/data states + delete via AlertDialog confirmation
// + re-fetch after mutation.
//
// Each row shows the gremium as a small badge so the editor can scan
// "which body's minutes is this" at a glance — handy when ASTA and STUPA
// protocols are interleaved in the same list.

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProtocolDTO } from "../../../../shared/types";
import {
  deleteProtocol,
  fetchAllProtocols,
} from "@/lib/admin-protocols";
import { Button } from "@/components/ui/button";
import GremiumBadge from "@/components/GremiumBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminProtocols() {
  const [protocols, setProtocols] = useState<ProtocolDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // useCallback so the effect dependency stays stable.
  const loadProtocols = useCallback(() => {
    setError(null);
    setProtocols(null);
    fetchAllProtocols()
      .then(setProtocols)
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, []);

  useEffect(() => {
    loadProtocols();
  }, [loadProtocols]);

  async function handleDelete(id: string) {
    try {
      await deleteProtocol(id);
      loadProtocols();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Protokolle verwalten</h1>
        <Button
          render={<Link to="/admin/protocols/new" />}
          nativeButton={false}
          size="lg"
          className="cursor-pointer"
        >
          Neues Protokoll
        </Button>
      </div>

      {error && (
        <p className="text-red-600 mb-4" role="alert">
          Fehler: {error}
        </p>
      )}

      {protocols === null ? (
        <p className="text-gray-500">Lädt…</p>
      ) : protocols.length === 0 ? (
        <p className="text-gray-500">
          Noch keine Protokolle. Klicke „Neues Protokoll“ um das erste
          hochzuladen.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {protocols.map((protocol) => (
            <li
              key={protocol.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <GremiumBadge gremium={protocol.gremium} />
                  <h2 className="font-semibold truncate">{protocol.title}</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Sitzung:{" "}
                  {new Date(protocol.meetingDate).toLocaleDateString("de-DE", {
                    dateStyle: "long",
                  })}
                  {" · "}
                  <a
                    href={protocol.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-asta-red hover:underline"
                  >
                    PDF ansehen
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  render={
                    <Link to={`/admin/protocols/${protocol.id}/edit`} />
                  }
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                >
                  Bearbeiten
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Löschen
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogTitle>Protokoll löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      „{protocol.title}“ wird unwiderruflich gelöscht. Auch die
                      PDF-Datei wird vom Server entfernt.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(protocol.id)}
                      >
                        Ja, löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
