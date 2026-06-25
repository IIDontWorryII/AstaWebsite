// client/src/pages/admin/gremien/AdminGremiumPage.tsx
//
// EDITOR view of a single Gremium page. Fetches the page via the same API the
// public view uses and renders each section as an InlineSection — the editor
// types directly on the heading/body/caption (no pencil, no drawer) and saves
// per section. On save we replace that section in `page.sections` locally so
// the UI updates without a refetch.
//
// State machine:
//   loading → page is null, no error → "Lädt…"
//   error   → error string
//   ready   → page rendered with inline-editable sections

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type {
  PageDTO,
  PageSectionDTO,
  PageSectionKind,
} from "../../../../../shared/types";
import { addSection, deleteSection, fetchPage, moveSection } from "@/lib/pages";
import { Button } from "@/components/ui/button";
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
import InlineSection from "./InlineSection";
import HeroImageEditor from "./HeroImageEditor";

/** Kinds the editor can add/reorder/delete freely (multi-instance). */
const REORDERABLE: ReadonlySet<PageSectionKind> = new Set([
  "MENU",
  "GALLERY",
]);

// REFERAT (AStA referate) and MEMBER (StuPa/Fachschaft people) are managed in
// the dedicated "Mitglieder" tool (/admin/mitglieder), so we hide them here to
// avoid a confusing second editor for the same data. The page-content editor
// keeps INFO/FREEFORM/MITGLIEDER text and MENU/GALLERY images.
const HIDDEN_KINDS: ReadonlySet<PageSectionKind> = new Set([
  "REFERAT",
  "MEMBER",
]);

type AddConfig = {
  label: string;
  kind: PageSectionKind;
  /** Noun shown in the confirm dialog ("X anlegen?"). */
  placeholder: string;
  /** Default field values for the freshly-created section. */
  initial?: { subtitle?: string; body?: string; caption?: string };
};

/**
 * "Add a new section" buttons per page slug. A page can offer several (e.g.
 * BaRACke adds menu images AND gallery photos). Pages without an entry get
 * no add buttons (all their sections are singletons).
 */
const ADD_CONFIG: Record<string, AddConfig[]> = {
  // NOTE: AStA referate and StuPa members are added in the "Mitglieder" tool
  // (/admin/mitglieder), so this editor offers no "add Referat/Mitglied" button.
  baracke: [
    {
      label: "+ Menübild hinzufügen",
      kind: "MENU",
      placeholder: "Menübild",
      initial: { caption: "Getränkekarte" },
    },
    {
      label: "+ Galeriebild hinzufügen",
      kind: "GALLERY",
      placeholder: "Galeriebild",
    },
  ],
  sport: [
    {
      label: "+ Programmbild hinzufügen",
      kind: "MENU",
      placeholder: "Programmbild",
      initial: { caption: "Sportprogramm" },
    },
    {
      label: "+ Galeriebild hinzufügen",
      kind: "GALLERY",
      placeholder: "Galeriebild",
    },
  ],
};

export default function AdminGremiumPage() {
  const { slug = "asta" } = useParams<{ slug: string }>();

  const [page, setPage] = useState<PageDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(() => {
    setError(null);
    setPage(null);
    fetchPage(slug)
      .then(setPage)
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, [slug]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  function handleSaved(updated: PageSectionDTO) {
    // Replace the saved section in local state — no refetch needed.
    setPage((prev) =>
      prev
        ? {
            ...prev,
            sections: prev.sections.map((s) =>
              s.id === updated.id ? updated : s,
            ),
          }
        : prev,
    );
  }

  async function handleDelete(id: string) {
    try {
      await deleteSection(id);
      loadPage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    }
  }

  async function handleMove(id: string, direction: "up" | "down") {
    try {
      const newSections = await moveSection(id, direction);
      if (page) setPage({ ...page, sections: newSections });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verschieben fehlgeschlagen");
    }
  }

  async function handleAdd(config: AddConfig) {
    try {
      await addSection(slug, config.kind, config.initial ?? {});
      // Reload to pick up the new section; it appears as an inline editor at
      // the end of the list, ready to edit in place.
      const fresh = await fetchPage(slug);
      setPage(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hinzufügen fehlgeschlagen");
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">Fehler: {error}</p>
      </div>
    );
  }
  if (!page) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Lädt…</p>
      </div>
    );
  }

  // Reorderable kinds (REFERAT, MEMBER, MENU, GALLERY) can move up/down
  // among their own kind. Compute the id list per kind so we know which
  // section is first/last and hide the arrow at the edges.
  const idsByKind = (kind: PageSectionKind) =>
    page!.sections.filter((s) => s.kind === kind).map((s) => s.id);

  function canMoveUp(section: PageSectionDTO): boolean {
    if (!REORDERABLE.has(section.kind)) return false;
    return section.id !== idsByKind(section.kind)[0];
  }
  function canMoveDown(section: PageSectionDTO): boolean {
    if (!REORDERABLE.has(section.kind)) return false;
    const ids = idsByKind(section.kind);
    return section.id !== ids[ids.length - 1];
  }
  function canDelete(section: PageSectionDTO): boolean {
    // Multi-instance kinds are freely deletable. MITGLIEDER is a legacy
    // STUPA text block we've replaced with member cards — allow deleting it
    // so editors can remove the leftover.
    return REORDERABLE.has(section.kind) || section.kind === "MITGLIEDER";
  }

  const addConfigs = ADD_CONFIG[slug] ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{page.title} bearbeiten</h1>
        <p className="text-sm text-gray-600 mt-1">
          Klicke direkt auf einen Text, um ihn zu bearbeiten. Änderungen
          speicherst du pro Abschnitt mit „Speichern“.
        </p>
      </header>

      <HeroImageEditor
        slug={slug}
        currentUrl={page.heroImageUrl}
        onUpdated={setPage}
      />

      <div className="space-y-6">
        {page.sections
          .filter((section) => !HIDDEN_KINDS.has(section.kind))
          .map((section) => (
            <InlineSection
              key={section.id}
              section={section}
              onSaved={handleSaved}
              onMoveUp={
                canMoveUp(section)
                  ? () => handleMove(section.id, "up")
                  : undefined
              }
              onMoveDown={
                canMoveDown(section)
                  ? () => handleMove(section.id, "down")
                  : undefined
              }
              onDelete={
                canDelete(section)
                  ? () => {
                      // Browser confirm for now — simpler than plumbing a
                      // dialog state per row.
                      if (
                        window.confirm(
                          `„${section.subtitle ?? "Abschnitt"}“ wirklich löschen?`,
                        )
                      ) {
                        handleDelete(section.id);
                      }
                    }
                  : undefined
              }
            />
          ))}
      </div>

      {/* Pages with entries in ADD_CONFIG get "add new section" button(s).
          BaRACke/Sport → Menü/Galerie. (AStA referate and StuPa members are
          added in the Mitglieder tool, not here.) */}
      {addConfigs.length > 0 && (
        <div className="border-t border-gray-200 pt-6 flex flex-wrap gap-3">
          {addConfigs.map((cfg) => (
            <AlertDialog key={cfg.kind}>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" className="cursor-pointer">
                    {cfg.label}
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogTitle>{cfg.placeholder} anlegen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ein neuer leerer Abschnitt wird am Ende der Liste angelegt. Du
                  kannst ihn danach direkt bearbeiten.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAdd(cfg)}>
                    Anlegen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      )}
    </div>
  );
}
