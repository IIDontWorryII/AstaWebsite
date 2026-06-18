// client/src/pages/admin/EventForm.tsx
//
// Shared event form used by both /admin/events/new and /admin/events/:id/edit.
//
//   - No `event` prop → create mode. Fields start empty. Submits to POST.
//   - `event` prop set → edit mode. Fields pre-populated from event.
//     Submits to PUT. The existing image is shown as a preview.
//
// File upload UI:
//   - <input type="file"> for selecting a new image.
//   - In edit mode, if no new file is selected the server keeps the
//     existing image (PUT semantics: omit field → leave unchanged).
//   - When a new file IS selected, we show a local preview (object URL)
//     instead of the server image so the editor sees what they're about
//     to upload.
//
// On success: navigate back to the admin list. On error: show the message
// inline and re-enable the submit button.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { EventDTO } from "../../../../shared/types";
import { EVENT_CATEGORIES } from "../../../../shared/types";
import {
  createEvent,
  updateEvent,
  type EventFormInput,
} from "@/lib/admin-events";
import { Button } from "@/components/ui/button";
import RichTextEditor, { isEmptyHtml } from "@/components/RichTextEditor";

interface EventFormProps {
  /** When set, the form is in edit mode and pre-fills from this event. */
  event?: EventDTO;
}

// ─── Date helpers ──────────────────────────────────────────────────────
//
// <input type="datetime-local"> uses the format "YYYY-MM-DDTHH:mm" and
// interprets it as the browser's local timezone. The DB stores UTC ISO
// strings. We translate both directions here.

/** Convert an ISO 8601 UTC string to the local-time format datetime-local expects. */
function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/** Interpret a datetime-local string as local time and return its UTC ISO equivalent. */
function datetimeLocalValueToISO(value: string): string {
  // new Date("2026-12-01T18:00") is parsed as LOCAL time in browsers,
  // which is exactly the conversion we want.
  return new Date(value).toISOString();
}

export default function EventForm({ event }: EventFormProps) {
  const navigate = useNavigate();
  const isEdit = event !== undefined;

  // ─── Text field state ───
  // In edit mode, pre-fill from the event. In create mode, blank.
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [place, setPlace] = useState(event?.place ?? "");
  const [startsAt, setStartsAt] = useState(
    event ? isoToDatetimeLocalValue(event.startsAt) : "",
  );
  const [price, setPrice] = useState(event?.price ?? "");
  // Multi-select referat tags. Start from the event's tags in edit mode.
  const [categories, setCategories] = useState<string[]>(
    event?.categories ?? [],
  );
  const [registrationEmail, setRegistrationEmail] = useState(
    event?.registrationEmail ?? "",
  );

  /** Add/remove a referat tag from the selection. */
  function toggleCategory(value: string) {
    setCategories((prev) =>
      prev.includes(value)
        ? prev.filter((c) => c !== value)
        : [...prev, value],
    );
  }

  // ─── File state ───
  // `file` is the newly-selected File (or null if none picked yet).
  // `previewUrl` is a temporary object URL for showing the local preview.
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Ref to the <input type="file"> so we can read/reset it programmatically.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── UI state ───
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Whenever the user picks a new file, generate a preview URL.
  // URL.createObjectURL gives us a "blob:..." URL the browser can render
  // without sending the file anywhere. We MUST revokeObjectURL when the
  // file changes (or on unmount) to free the memory.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    // input.files is a FileList (DOM type) — read the first one or null.
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
  }

  /** Reset the file picker to "no file" — used when the user wants to keep the existing image. */
  function clearSelectedFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // The rich-text editor replaces the native `required` textarea, so check
    // for an empty description ("<p></p>") here before submitting.
    if (isEmptyHtml(description)) {
      setError("Bitte gib eine Beschreibung ein.");
      return;
    }

    setSubmitting(true);

    try {
      // Convert the local datetime back to a UTC ISO string for the server.
      const input: EventFormInput = {
        title,
        description,
        place,
        startsAt: datetimeLocalValueToISO(startsAt),
        // Empty price string → undefined so we don't send "" to the server.
        price: price.trim() === "" ? undefined : price,
        // Selected referate (possibly empty → untagged).
        categories,
        // "" = no registration required.
        registrationEmail: registrationEmail.trim(),
      };

      if (isEdit) {
        await updateEvent(event!.id, input, file);
      } else {
        await createEvent(input, file);
      }
      navigate("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  // Decide which image to preview:
  //   - If a new file was picked: local preview blob.
  //   - Else if editing and the event has an image: that.
  //   - Else: nothing.
  const imageToShow = previewUrl ?? (isEdit ? event!.imageUrl : null);

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? "Event bearbeiten" : "Neues Event"}
      </h1>

      {/* Two columns: all the text/details on the LEFT, the poster preview +
          upload + actions on the RIGHT. The right column is sticky so the
          editor can keep an eye on how the poster looks while editing. */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-8 md:grid-cols-[1.5fr_1fr] items-start"
      >
        {/* ─── Left: details ─── */}
        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-1">
              Titel
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <span className="block text-sm font-semibold mb-1">
              Beschreibung
            </span>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              ariaLabel="Beschreibung"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="place"
                className="block text-sm font-semibold mb-1"
              >
                Ort
              </label>
              <input
                id="place"
                type="text"
                required
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label
                htmlFor="startsAt"
                className="block text-sm font-semibold mb-1"
              >
                Datum & Uhrzeit
              </label>
              <input
                id="startsAt"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-semibold mb-1">
              Preis{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="price"
              type="text"
              placeholder="z.B. 5€ oder Frei"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Referate: multiple allowed — an event can be co-organized. */}
          <fieldset>
            <legend className="block text-sm font-semibold mb-1">
              Referate{" "}
              <span className="text-gray-500 font-normal">
                (mehrere möglich, optional)
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {EVENT_CATEGORIES.map((c) => {
                const selected = categories.includes(c.value);
                return (
                  <label
                    key={c.value}
                    className={`cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm ${
                      selected
                        ? "bg-asta-red text-white border-asta-red"
                        : "bg-white text-gray-700 border-gray-300 hover:border-asta-red"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selected}
                      onChange={() => toggleCategory(c.value)}
                    />
                    {c.label}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bestimmt, auf welchen Referat-Seiten das Event in „Bevorstehende
              Events“ erscheint.
            </p>
          </fieldset>

          <div>
            <label
              htmlFor="registrationEmail"
              className="block text-sm font-semibold mb-1"
            >
              Anmeldung per E-Mail{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="registrationEmail"
              type="email"
              placeholder="z.B. rac-asta-vorsitz@rheinahrcampus.de"
              value={registrationEmail}
              onChange={(e) => setRegistrationEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Wenn gesetzt, zeigt das Event einen „Sich anmelden“-Button, der
              eine E-Mail an diese Adresse öffnet.
            </p>
          </div>
        </div>

        {/* ─── Right: poster preview + upload + actions ─── */}
        <div className="space-y-4 md:sticky md:top-24">
          {/* Large preview in the same 4:5 frame the public cards/popup use,
              so the editor sees exactly how the poster will be displayed. */}
          <div>
            <p className="text-sm font-semibold mb-1">Poster-Vorschau</p>
            {imageToShow ? (
              <img
                src={imageToShow}
                alt="Event-Poster Vorschau"
                className="w-full aspect-[4/5] object-contain rounded-lg border border-gray-200 bg-gray-100"
              />
            ) : (
              <div className="w-full aspect-[4/5] grid place-items-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm">
                Noch kein Bild
              </div>
            )}
            {isEdit && imageToShow && !file && (
              <p className="text-xs text-gray-500 mt-1">
                Aktuelles Bild. Lade ein neues hoch, um es zu ersetzen.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="image" className="sr-only">
              Bild hochladen
            </label>
            <input
              id="image"
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:cursor-pointer hover:file:bg-gray-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              PNG / JPEG / WebP, max. 20 MB.
            </p>
            {file && (
              <button
                type="button"
                onClick={clearSelectedFile}
                className="text-xs text-asta-red mt-1 cursor-pointer hover:underline"
              >
                Neue Datei verwerfen
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm" role="alert">
              Fehler: {error}
            </p>
          )}

          <div className="flex flex-col gap-3 pt-2">
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
                  : "Event erstellen"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/admin/events")}
              className="cursor-pointer"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
