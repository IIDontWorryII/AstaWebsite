// client/src/pages/admin/MemberEditorDrawer.tsx
//
// Add/edit form for one roster entry in the "Mitglieder" tool. Drives three
// member types over the same PageSection storage:
//
//   referat    (AStA)        → subtitle = Referat, caption = Inhaber:in,
//                              email, body = Beschreibung, photo
//   member     (StuPa)       → subtitle = Rolle, caption = Name, photo
//   fachschaft (Fachschaft)  → subtitle = Fakultät (FS MIT / FS WiSo),
//                              caption = Name, photo
//
// New entries: addSection() with the text fields, then (if a photo was
// picked) updateSection() to attach it. Existing entries: updateSection().

import { useEffect, useRef, useState } from "react";
import type { PageSectionDTO } from "../../../../shared/types";
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
import { addSection, updateSection } from "@/lib/pages";
import { FACULTIES, initials, type MemberType } from "@/lib/members";
import RichTextEditor, { isEmptyHtml } from "@/components/RichTextEditor";

interface MemberEditorDrawerProps {
  open: boolean;
  /** "new" → create on `slug`; "edit" → update `section`. */
  mode: "new" | "edit";
  type: MemberType;
  /** Page slug to create on (new mode). */
  slug: string;
  /** Existing section (edit mode); null for new. */
  section: PageSectionDTO | null;
  /** Referat names from the AStA page, offered as a datalist on the role field. */
  roleOptions: string[];
  /** Called when the drawer closes. `changed` = something was saved. */
  onClose: (changed: boolean) => void;
}

const NOUN: Record<MemberType, string> = {
  referat: "Referat",
  member: "Mitglied",
  fachschaft: "Mitglied",
};

export default function MemberEditorDrawer({
  open,
  mode,
  type,
  slug,
  section,
  roleOptions,
  onClose,
}: MemberEditorDrawerProps) {
  const [subtitle, setSubtitle] = useState("");
  const [caption, setCaption] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form whenever the drawer opens (or the target changes).
  useEffect(() => {
    if (!open) return;
    setSubtitle(section?.subtitle ?? "");
    setCaption(section?.caption ?? "");
    setBody(section?.body ?? "");
    setEmail(section?.email ?? "");
    setFile(null);
    setRemoveImage(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, section]);

  // Local blob preview for a freshly-picked photo.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const isReferat = type === "referat";
  const isFachschaft = type === "fachschaft";

  // Which image to show in the live preview circle.
  const previewSrc =
    previewUrl ?? (removeImage ? null : section?.imageUrl ?? null);

  async function handleSave() {
    setError(null);
    setSubmitting(true);
    try {
      // Build the text fields for this member type. body is only sent when
      // non-empty (the server rejects an empty body).
      const fields: {
        subtitle?: string;
        caption?: string;
        body?: string;
        email?: string;
      } = {
        subtitle,
        caption,
      };
      if (isReferat) {
        fields.email = email;
        // body is optional here — only send it when the editor has content
        // (an empty editor serializes to "<p></p>").
        if (!isEmptyHtml(body)) fields.body = body;
      }

      if (mode === "new") {
        const kind = isReferat ? "REFERAT" : "MEMBER";
        const created = await addSection(slug, kind, fields);
        // addSection is JSON-only; a photo needs a follow-up multipart PUT.
        if (file) await updateSection(created.id, {}, file);
      } else if (section) {
        await updateSection(section.id, fields, file, removeImage);
      }
      onClose(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    mode === "new" ? `${NOUN[type]} hinzufügen` : `${NOUN[type]} bearbeiten`;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose(false)}>
      <DrawerContent>
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>
          Änderungen erscheinen nach dem Speichern auf der öffentlichen Seite.
        </DrawerDescription>

        <DrawerBody>
          {/* Live preview circle. */}
          <div className="flex flex-col items-center mb-6">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="Vorschau"
                className="w-24 h-24 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 grid place-items-center text-xl text-gray-500">
                {initials(caption)}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Name (referat → holder, member/fachschaft → person's name). */}
            <div>
              <label htmlFor="m-caption" className="block text-sm font-semibold mb-1">
                {isReferat ? "Inhaber:in" : "Name"}
              </label>
              <input
                id="m-caption"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="z.B. Vorname Nachname"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Role / Referat / Faculty — the subtitle, labelled per type. */}
            {isFachschaft ? (
              <div>
                <label htmlFor="m-faculty" className="block text-sm font-semibold mb-1">
                  Fachschaft
                </label>
                <select
                  id="m-faculty"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                >
                  <option value="">— auswählen —</option>
                  {FACULTIES.map((f) => (
                    <option key={f.key} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="m-subtitle" className="block text-sm font-semibold mb-1">
                  {isReferat ? "Referat" : "Rolle / Position"}
                </label>
                <input
                  id="m-subtitle"
                  type="text"
                  list="referat-options"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={isReferat ? "z.B. Kultur" : "z.B. Präsident:in"}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <datalist id="referat-options">
                  {roleOptions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
            )}

            {/* Referat-only: email + description. */}
            {isReferat && (
              <>
                <div>
                  <label htmlFor="m-email" className="block text-sm font-semibold mb-1">
                    E-Mail{" "}
                    <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="m-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="referat@asta-remagen.de"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <span className="block text-sm font-semibold mb-1">
                    Beschreibung
                  </span>
                  <RichTextEditor
                    value={body}
                    onChange={setBody}
                    ariaLabel="Beschreibung"
                  />
                </div>
              </>
            )}

            {/* Photo. */}
            <div>
              <label htmlFor="m-image" className="block text-sm font-semibold mb-1">
                Foto{" "}
                <span className="text-gray-500 font-normal">
                  (wird quadratisch zugeschnitten)
                </span>
              </label>
              <input
                id="m-image"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  if (e.target.files?.[0]) setRemoveImage(false);
                }}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:cursor-pointer hover:file:bg-gray-200"
              />
              {section?.imageUrl && !file && (
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                  />
                  Foto entfernen
                </label>
              )}
            </div>

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
    </Drawer>
  );
}
