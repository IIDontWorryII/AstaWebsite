// client/src/pages/admin/gremien/SectionEditorDrawer.tsx
//
// Drawer that holds the per-kind edit form for a PageSection. Drives all
// fields uniformly — different kinds just show/hide field groups:
//
//   INFO       → image, body
//   REFERAT    → image, subtitle (title), caption (holder), body, email
//   MITGLIEDER → image, subtitle (heading), body
//   FREEFORM   → subtitle, body
//
// Save calls updateSection() with the edited fields. New image (if picked)
// rides along; if no new file, the existing image stays.

import { useEffect, useRef, useState } from "react";
import type { PageSectionDTO } from "../../../../../shared/types";
import {
  Drawer,
  DrawerAction,
  DrawerBody,
  DrawerCancel,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer";
import { updateSection } from "@/lib/pages";

interface SectionEditorDrawerProps {
  /** When set, the drawer is open and edits this section. */
  section: PageSectionDTO | null;
  /** Called with the updated section on save, or null on cancel/close. */
  onClose: (saved: PageSectionDTO | null) => void;
}

function hasImage(kind: string): boolean {
  return (
    kind === "INFO" ||
    kind === "REFERAT" ||
    kind === "MITGLIEDER" ||
    kind === "MEMBER"
  );
}
function hasSubtitle(kind: string): boolean {
  return (
    kind === "REFERAT" ||
    kind === "MITGLIEDER" ||
    kind === "FREEFORM" ||
    kind === "MEMBER"
  );
}
function hasCaption(kind: string): boolean {
  // REFERAT uses caption for holder name; MEMBER uses it for the person's name.
  return kind === "REFERAT" || kind === "MEMBER";
}
function hasEmail(kind: string): boolean {
  return kind === "REFERAT";
}

const KIND_LABEL: Record<string, string> = {
  INFO: "Info",
  REFERAT: "Referat",
  MITGLIEDER: "Mitglieder",
  FREEFORM: "Abschnitt",
  MEMBER: "Mitglied",
};

// The "subtitle" field means different things per kind. The drawer's
// label should reflect that.
function subtitleLabel(kind: string): string {
  switch (kind) {
    case "REFERAT":
      return "Titel";
    case "MEMBER":
      return "Rolle / Position";
    default:
      return "Überschrift";
  }
}

// Same for the "caption" field — REFERAT uses it for the holder, MEMBER
// uses it for the person's name.
function captionLabel(kind: string): string {
  switch (kind) {
    case "MEMBER":
      return "Name";
    case "REFERAT":
    default:
      return "Inhaber:in";
  }
}

export default function SectionEditorDrawer({
  section,
  onClose,
}: SectionEditorDrawerProps) {
  // Local form state — initialized from the section when the drawer opens.
  // Stored as separate fields so each is independently editable.
  const [subtitle, setSubtitle] = useState("");
  const [body, setBody] = useState("");
  const [caption, setCaption] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state whenever a different section is loaded into the drawer.
  useEffect(() => {
    if (section) {
      setSubtitle(section.subtitle ?? "");
      setBody(section.body ?? "");
      setCaption(section.caption ?? "");
      setEmail(section.email ?? "");
      setFile(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [section]);

  // Drawer's open state is purely derived from whether we have a section.
  const open = section !== null;

  async function handleSave() {
    if (!section) return;
    setError(null);
    setSubmitting(true);
    try {
      // We send every visible field, including empty strings — the server
      // interprets "" as "clear this field" for optional ones.
      const updates: {
        subtitle?: string;
        body?: string;
        caption?: string;
        email?: string;
      } = {};
      if (hasSubtitle(section.kind)) updates.subtitle = subtitle;
      updates.body = body;
      if (hasCaption(section.kind)) updates.caption = caption;
      if (hasEmail(section.kind)) updates.email = email;

      const updated = await updateSection(section.id, updates, file);
      onClose(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose(null)}>
      {section && (
        <DrawerContent>
          <DrawerTitle>
            {KIND_LABEL[section.kind] ?? "Abschnitt"} bearbeiten
          </DrawerTitle>
          <DrawerDescription>
            Änderungen werden sofort auf der öffentlichen Seite sichtbar.
          </DrawerDescription>

          <DrawerBody>
            <div className="space-y-4">
              {hasSubtitle(section.kind) && (
                <div>
                  <label
                    htmlFor="subtitle"
                    className="block text-sm font-semibold mb-1"
                  >
                    {subtitleLabel(section.kind)}
                  </label>
                  <input
                    id="subtitle"
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              )}

              {hasCaption(section.kind) && (
                <div>
                  <label
                    htmlFor="caption"
                    className="block text-sm font-semibold mb-1"
                  >
                    {captionLabel(section.kind)}
                  </label>
                  <input
                    id="caption"
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="z.B. Vorname Nachname"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="body"
                  className="block text-sm font-semibold mb-1"
                >
                  Text
                </label>
                <textarea
                  id="body"
                  rows={10}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 font-sans"
                />
              </div>

              {hasEmail(section.kind) && (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="(leer lassen, um zu entfernen)"
                  />
                </div>
              )}

              {hasImage(section.kind) && (
                <div>
                  <label
                    htmlFor="image"
                    className="block text-sm font-semibold mb-1"
                  >
                    Bild{" "}
                    <span className="text-gray-500 font-normal">
                      (optional — leer lassen, um das bestehende zu behalten)
                    </span>
                  </label>
                  <input
                    id="image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:cursor-pointer hover:file:bg-gray-200"
                  />
                  {section.imageUrl && !file && (
                    <p className="text-xs text-gray-500 mt-2">
                      Aktuell:
                    </p>
                  )}
                  {section.imageUrl && !file && (
                    <img
                      src={section.imageUrl}
                      alt="aktuell"
                      className="mt-1 max-h-32 rounded border border-gray-200"
                    />
                  )}
                </div>
              )}

              {error && (
                <p className="text-red-600 text-sm" role="alert">
                  Fehler: {error}
                </p>
              )}
            </div>
          </DrawerBody>

          <DrawerFooter>
            <DrawerCancel>Abbrechen</DrawerCancel>
            <DrawerAction onClick={handleSave} disabled={submitting}>
              {submitting ? "Speichert…" : "Speichern"}
            </DrawerAction>
          </DrawerFooter>
        </DrawerContent>
      )}
    </Drawer>
  );
}
