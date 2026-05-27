// client/src/pages/admin/ProtocolForm.tsx
//
// Shared protocol form used by /admin/protocols/new and /:id/edit.
// Mirrors EventForm (AW-36):
//   - No `protocol` prop → create mode. File is REQUIRED (a protocol is its PDF).
//   - `protocol` prop set → edit mode. Fields pre-populated. File optional
//     (omit to keep the current PDF).
//
// The gremium is a select (dropdown) so admins can't typo arbitrary
// values — only the gremien that have a public protocol section get
// listed. To add a new gremium, extend GREMIUM_OPTIONS below.

import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { ProtocolDTO } from "../../../../shared/types";
import {
  createProtocol,
  updateProtocol,
  type ProtocolFormInput,
} from "@/lib/admin-protocols";
import { Button } from "@/components/ui/button";

interface ProtocolFormProps {
  /** When set, the form is in edit mode and pre-fills from this protocol. */
  protocol?: ProtocolDTO;
}

/**
 * Allowed gremium values. Must match the gremium strings that the
 * GremiumProtocols component fetches with — currently ASTA and STUPA
 * are the two Gremien pages with a Protokolle section. Fachschaft
 * subpages will add more once those pages exist.
 */
const GREMIUM_OPTIONS = [
  { value: "ASTA", label: "AStA" },
  { value: "STUPA", label: "StuPa" },
] as const;

// ─── Date helpers ──────────────────────────────────────────────────────
//
// Protocols use a date-only picker (the meeting day matters, the exact
// minute doesn't). HTML <input type="date"> uses "YYYY-MM-DD" format.
// We convert to/from the server's ISO 8601 with the date at 00:00 UTC.

function isoToDateInputValue(iso: string): string {
  // Use UTC date components so the value matches the date the editor
  // originally entered, regardless of their local timezone.
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function dateInputValueToISO(value: string): string {
  // Parse as UTC midnight to avoid timezone drift (e.g. 2026-04-15 in
  // CEST becoming 2026-04-14T22:00:00Z if we treated it as local).
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export default function ProtocolForm({ protocol }: ProtocolFormProps) {
  const navigate = useNavigate();
  const isEdit = protocol !== undefined;

  const [gremium, setGremium] = useState<string>(
    protocol?.gremium ?? GREMIUM_OPTIONS[0].value,
  );
  const [title, setTitle] = useState(protocol?.title ?? "");
  const [meetingDate, setMeetingDate] = useState(
    protocol ? isoToDateInputValue(protocol.meetingDate) : "",
  );

  // PDF file state. In edit mode, `file` is null until the user picks a
  // replacement — keeping the existing PDF (server-side keep-on-omit logic).
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Clean up the file input value when the user clears the selection.
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
  }

  function clearSelectedFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Create mode requires a file. Edit mode allows omitting (keep existing).
    if (!isEdit && !file) {
      setError("Bitte eine PDF-Datei auswählen.");
      return;
    }

    setSubmitting(true);
    try {
      const input: ProtocolFormInput = {
        gremium,
        title,
        meetingDate: dateInputValueToISO(meetingDate),
      };

      if (isEdit) {
        await updateProtocol(protocol!.id, input, file);
      } else {
        // file is non-null thanks to the guard above; cast for TypeScript.
        await createProtocol(input, file!);
      }
      navigate("/admin/protocols");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? "Protokoll bearbeiten" : "Neues Protokoll"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="gremium"
            className="block text-sm font-semibold mb-1"
          >
            Gremium
          </label>
          <select
            id="gremium"
            required
            value={gremium}
            onChange={(e) => setGremium(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
          >
            {GREMIUM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-semibold mb-1">
            Titel
          </label>
          <input
            id="title"
            type="text"
            required
            placeholder="z.B. Sitzung Sommerfest-Planung"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="meetingDate"
            className="block text-sm font-semibold mb-1"
          >
            Sitzungsdatum
          </label>
          <input
            id="meetingDate"
            type="date"
            required
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-semibold mb-1">
            PDF{" "}
            <span className="text-gray-500 font-normal">
              {isEdit
                ? "(optional — leer lassen, um die bestehende Datei zu behalten)"
                : "(erforderlich, max. 20 MB)"}
            </span>
          </label>
          <input
            id="file"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            // Required only in create mode. In edit mode, omitting keeps
            // the existing PDF on the server.
            required={!isEdit}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:cursor-pointer hover:file:bg-gray-200"
          />
          {file && (
            <button
              type="button"
              onClick={clearSelectedFile}
              className="text-xs text-asta-red mt-1 cursor-pointer hover:underline"
            >
              Neue Datei verwerfen
            </button>
          )}
          {isEdit && protocol!.fileUrl && (
            <p className="text-xs text-gray-500 mt-1">
              Aktuell:{" "}
              <a
                href={protocol!.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-asta-red hover:underline"
              >
                bestehende PDF ansehen
              </a>
            </p>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm" role="alert">
            Fehler: {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="cursor-pointer"
          >
            {submitting
              ? "Speichert…"
              : isEdit
                ? "Speichern"
                : "Protokoll hochladen"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/admin/protocols")}
            className="cursor-pointer"
          >
            Abbrechen
          </Button>
        </div>
      </form>
    </section>
  );
}
