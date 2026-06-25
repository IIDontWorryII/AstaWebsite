// client/src/pages/admin/gremien/InlineSection.tsx
//
// Inline, in-place editor for one PageSection in the Seiteninhalte tool.
// Replaces the old pencil → drawer flow (Jonas feedback): the editor works
// directly on the rendered content — TipTap for the body, plain inputs styled
// as the heading/caption, and a small control on the image to swap/remove it.
// Nothing auto-saves: a Speichern / Verwerfen bar appears only once something
// changed, and persists via updateSection().

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, ImageUp, Trash2, X } from "lucide-react";
import type { PageSectionDTO } from "../../../../../shared/types";
import { updateSection, type SectionUpdateInput } from "@/lib/pages";
import RichTextEditor, { isEmptyHtml } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";

// Which fields each (visible) kind exposes. Mirrors SectionEditorDrawer, but
// scoped to the kinds Seiteninhalte still shows (REFERAT/MEMBER are managed in
// the Mitglieder tool).
function hasSubtitle(kind: string): boolean {
  return kind === "MITGLIEDER" || kind === "FREEFORM";
}
function hasBody(kind: string): boolean {
  return kind === "INFO" || kind === "MITGLIEDER" || kind === "FREEFORM";
}
function hasCaption(kind: string): boolean {
  return kind === "MENU" || kind === "GALLERY";
}
function hasImage(kind: string): boolean {
  // INFO is text-only here (its photo lives in the hero), so no image control.
  return (
    kind === "MITGLIEDER" ||
    kind === "FREEFORM" ||
    kind === "MENU" ||
    kind === "GALLERY"
  );
}

const KIND_LABEL: Record<string, string> = {
  INFO: "Info",
  MITGLIEDER: "Mitglieder",
  FREEFORM: "Abschnitt",
  MENU: "Menübild",
  GALLERY: "Galeriebild",
};

/** Normalize body HTML so an empty editor ("<p></p>") compares as "". */
function normalizeBody(html: string): string {
  return isEmptyHtml(html) ? "" : html;
}

interface InlineSectionProps {
  section: PageSectionDTO;
  /** Called with the saved section so the parent can update its list. */
  onSaved: (updated: PageSectionDTO) => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function InlineSection({
  section,
  onSaved,
  onDelete,
  onMoveUp,
  onMoveDown,
}: InlineSectionProps) {
  const kind = section.kind;

  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [body, setBody] = useState(section.body ?? "");
  const [caption, setCaption] = useState(section.caption ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-sync from the section whenever its identity changes (i.e. after a save,
  // when the parent swaps in the updated object). In-progress edits keep the
  // same section object, so they're never clobbered mid-edit.
  useEffect(() => {
    setSubtitle(section.subtitle ?? "");
    setBody(section.body ?? "");
    setCaption(section.caption ?? "");
    setFile(null);
    setRemoveImage(false);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [section]);

  // Free the object URL created for a freshly-picked image preview.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const dirty =
    (hasSubtitle(kind) && subtitle !== (section.subtitle ?? "")) ||
    (hasBody(kind) && normalizeBody(body) !== (section.body ?? "")) ||
    (hasCaption(kind) && caption !== (section.caption ?? "")) ||
    file !== null ||
    removeImage;

  function pickFile() {
    fileInputRef.current?.click();
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    setRemoveImage(false);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function requestRemoveImage() {
    setFile(null);
    setPreviewUrl(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDiscard() {
    setSubtitle(section.subtitle ?? "");
    setBody(section.body ?? "");
    setCaption(section.caption ?? "");
    setFile(null);
    setRemoveImage(false);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    setError(null);
    setSubmitting(true);
    try {
      const updates: SectionUpdateInput = {};
      if (hasSubtitle(kind)) updates.subtitle = subtitle;
      if (hasBody(kind)) updates.body = normalizeBody(body);
      if (hasCaption(kind)) updates.caption = caption;
      const updated = await updateSection(section.id, updates, file, removeImage);
      onSaved(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  }

  // What the image control should show: a freshly-picked preview, the stored
  // image (unless removal is pending), or nothing.
  const shownImage = previewUrl ?? (removeImage ? null : section.imageUrl);

  const iconBtn =
    "grid place-items-center h-8 w-8 rounded bg-white/90 border border-gray-200 shadow-sm hover:bg-white cursor-pointer";

  return (
    <div className="rounded-lg border border-gray-200 p-5">
      {/* Kind label + structural controls (no edit pencil — editing is inline). */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {KIND_LABEL[kind] ?? "Abschnitt"}
        </span>
        <div className="flex gap-1">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              title="Nach oben verschieben"
              className={iconBtn}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              title="Nach unten verschieben"
              className={iconBtn}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Löschen"
              className={`${iconBtn} hover:text-red-600`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Heading (inline) */}
      {hasSubtitle(kind) && (
        <div className="mb-4">
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            aria-label="Überschrift"
            placeholder="Überschrift"
            className="w-full border-0 border-b-2 border-transparent px-0 text-2xl font-bold focus:border-asta-red focus:outline-none md:text-3xl"
          />
          <div className="mt-2 h-1 w-12 rounded bg-asta-red" />
        </div>
      )}

      {/* Image control */}
      {hasImage(kind) && (
        <div className="mb-4">
          {shownImage ? (
            <div className="relative inline-block">
              <img
                src={shownImage}
                alt=""
                className="max-h-48 rounded border border-gray-200"
              />
              <div className="absolute right-1 top-1 flex gap-1">
                <button
                  type="button"
                  onClick={pickFile}
                  title="Bild ändern"
                  className={iconBtn}
                >
                  <ImageUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={requestRemoveImage}
                  title="Bild entfernen"
                  className={`${iconBtn} hover:text-red-600`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={pickFile}
              className="flex items-center gap-2 rounded border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:border-asta-red hover:text-asta-red"
            >
              <ImageUp className="h-5 w-5" />
              Bild hinzufügen
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onPickFile}
            className="hidden"
          />
        </div>
      )}

      {/* Body (inline rich-text) */}
      {hasBody(kind) && (
        <RichTextEditor value={body} onChange={setBody} ariaLabel="Text" />
      )}

      {/* Caption (inline) */}
      {hasCaption(kind) && (
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          aria-label="Bildunterschrift"
          placeholder="Bildunterschrift"
          className="mt-3 w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      )}

      {/* Save bar — only when something changed. */}
      {dirty && (
        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3">
          <Button onClick={handleSave} disabled={submitting} className="cursor-pointer">
            {submitting ? "Speichert…" : "Speichern"}
          </Button>
          <button
            type="button"
            onClick={handleDiscard}
            disabled={submitting}
            className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer disabled:opacity-50"
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
