// client/src/pages/admin/gremien/HeroImageEditor.tsx
//
// Lets an EDITOR set/replace/remove the hero background image for a page.
// Used at the top of AdminGremiumPage for all five editable pages.

import { useRef, useState } from "react";
import type { PageDTO } from "../../../../../shared/types";
import { updatePageHero } from "@/lib/pages";
import { Button } from "@/components/ui/button";

interface HeroImageEditorProps {
  slug: string;
  currentUrl: string | null;
  /** Called with the refreshed page after a successful change. */
  onUpdated: (page: PageDTO) => void;
}

export default function HeroImageEditor({
  slug,
  currentUrl,
  onUpdated,
}: HeroImageEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function run(action: () => Promise<PageDTO>) {
    setError(null);
    setSubmitting(true);
    try {
      const page = await action();
      onUpdated(page);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h2 className="font-semibold mb-3">Hero-Bild</h2>

      {currentUrl ? (
        <img
          src={currentUrl}
          alt="Aktuelles Hero-Bild"
          className="max-h-32 rounded border border-gray-200 mb-3"
        />
      ) : (
        <p className="text-sm text-gray-500 mb-3">
          Kein eigenes Hero-Bild gesetzt – es wird das Standardbild der Seite
          angezeigt.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:cursor-pointer hover:file:bg-gray-200"
      />

      <div className="flex gap-2 mt-3">
        <Button
          onClick={() => run(() => updatePageHero(slug, file))}
          disabled={!file || submitting}
          className="cursor-pointer"
        >
          {submitting ? "Speichert…" : "Hero-Bild speichern"}
        </Button>
        {currentUrl && (
          <Button
            variant="outline"
            onClick={() => run(() => updatePageHero(slug, null, true))}
            disabled={submitting}
            className="cursor-pointer"
          >
            Entfernen
          </Button>
        )}
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-2" role="alert">
          Fehler: {error}
        </p>
      )}
    </div>
  );
}
