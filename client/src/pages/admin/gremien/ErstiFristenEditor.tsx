// client/src/pages/admin/gremien/ErstiFristenEditor.tsx
//
// Editor panel for the Ersti-Info "Fristen & Termine" block, shown at the top
// of the Seiteninhalte editor for the `ersti` page. Two free-text date ranges
// plus two uploadable Prüfungstermine PDFs (MIT / WiSo). Saved explicitly,
// like the inline sections.

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileText, Upload, X } from "lucide-react";
import type { ErstiInfoDTO } from "../../../../../shared/types";
import { fetchErsti, updateErsti } from "@/lib/ersti";
import SectionHeader from "@/components/SectionHeader";
import { Button } from "@/components/ui/button";

export default function ErstiFristenEditor() {
  const [info, setInfo] = useState<ErstiInfoDTO | null>(null);
  const [pruefungsanmeldung, setPa] = useState("");
  const [klausurenphase, setKl] = useState("");
  const [mitFile, setMitFile] = useState<File | null>(null);
  const [wisoFile, setWisoFile] = useState<File | null>(null);
  const [removeMit, setRemoveMit] = useState(false);
  const [removeWiso, setRemoveWiso] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchErsti()
      .then((d) => {
        setInfo(d);
        setPa(d.pruefungsanmeldung ?? "");
        setKl(d.klausurenphase ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, []);

  const dirty =
    info != null &&
    (pruefungsanmeldung !== (info.pruefungsanmeldung ?? "") ||
      klausurenphase !== (info.klausurenphase ?? "") ||
      mitFile != null ||
      wisoFile != null ||
      removeMit ||
      removeWiso);

  function reset(next: ErstiInfoDTO) {
    setInfo(next);
    setPa(next.pruefungsanmeldung ?? "");
    setKl(next.klausurenphase ?? "");
    setMitFile(null);
    setWisoFile(null);
    setRemoveMit(false);
    setRemoveWiso(false);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const next = await updateErsti(
        { pruefungsanmeldung, klausurenphase },
        mitFile,
        wisoFile,
        removeMit,
        removeWiso,
      );
      reset(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  if (error && !info) {
    return <p className="text-red-600">Fehler: {error}</p>;
  }
  if (!info) {
    return <p className="text-gray-500">Lädt…</p>;
  }

  return (
    <div className="rounded-lg border border-gray-200 p-5">
      <SectionHeader title="Fristen & Termine" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Prüfungsanmeldung-Zeitraum
          </span>
          <input
            type="text"
            value={pruefungsanmeldung}
            onChange={(e) => setPa(e.target.value)}
            placeholder="z.B. 01.–15.06.2026"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Klausurenphase-Zeitraum
          </span>
          <input
            type="text"
            value={klausurenphase}
            onChange={(e) => setKl(e.target.value)}
            placeholder="z.B. 08.–26.07.2026"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <PdfField
          label="Prüfungstermine MIT"
          currentUrl={removeMit ? null : info.pruefungstermineMitUrl}
          file={mitFile}
          onPick={(f) => {
            setMitFile(f);
            setRemoveMit(false);
          }}
          onRemove={() => {
            setMitFile(null);
            setRemoveMit(true);
          }}
        />
        <PdfField
          label="Prüfungstermine WiSo"
          currentUrl={removeWiso ? null : info.pruefungstermineWisoUrl}
          file={wisoFile}
          onPick={(f) => {
            setWisoFile(f);
            setRemoveWiso(false);
          }}
          onRemove={() => {
            setWisoFile(null);
            setRemoveWiso(true);
          }}
        />
      </div>

      {dirty && (
        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3">
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
            {saving ? "Speichert…" : "Speichern"}
          </Button>
          <button
            type="button"
            onClick={() => reset(info)}
            disabled={saving}
            className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            Verwerfen
          </button>
          {error && (
            <span className="text-sm text-red-600" role="alert">
              Fehler: {error}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function PdfField({
  label,
  currentUrl,
  file,
  onPick,
  onRemove,
}: {
  label: string;
  currentUrl: string | null;
  file: File | null;
  onPick: (f: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded border border-gray-200 p-3">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {file ? (
          <span className="inline-flex items-center gap-1 text-gray-700">
            <FileText className="h-4 w-4" /> {file.name} (neu)
          </span>
        ) : currentUrl ? (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-asta-red hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> Aktuelle Datei
          </a>
        ) : (
          <span className="text-gray-400">Keine Datei</span>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 hover:border-asta-red cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" /> {file || currentUrl ? "Ändern" : "Hochladen"}
        </button>
        {(file || currentUrl) && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-gray-600 hover:border-red-300 hover:text-red-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Entfernen
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
        className="hidden"
      />
    </div>
  );
}
