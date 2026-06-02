// client/src/pages/admin/gremien/AdminGremiumPage.tsx
//
// EDITOR view of a single Gremium page. Fetches the page via the same
// API the public view uses, renders the SAME section components, but
// wraps each one in EditableSection so the editor sees pencil/move/
// delete affordances.
//
// State machine:
//   loading  → page is null, no error → "Lädt…"
//   error    → error string
//   ready    → page rendered with editable sections
//
// editing  → null = no drawer open; otherwise a section is being edited.
//            On save, we replace that section in `page.sections` locally
//            so the UI updates without a full refetch.

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { PageDTO, PageSectionDTO } from "../../../../../shared/types";
import {
  addReferatSection,
  deleteSection,
  fetchPage,
  moveSection,
} from "@/lib/pages";
import InfoSection from "@/components/gremien/InfoSection";
import ReferatCard from "@/components/gremien/ReferatCard";
import MitgliederSection from "@/components/gremien/MitgliederSection";
import FreeformSection from "@/components/gremien/FreeformSection";
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
import EditableSection from "./EditableSection";
import SectionEditorDrawer from "./SectionEditorDrawer";

/** Pick the right renderer for a section based on its kind. */
function renderSectionByKind(section: PageSectionDTO) {
  switch (section.kind) {
    case "INFO":
      return <InfoSection section={section} />;
    case "REFERAT":
      return <ReferatCard section={section} />;
    case "MITGLIEDER":
      return <MitgliederSection section={section} />;
    case "FREEFORM":
      return <FreeformSection section={section} />;
  }
}

export default function AdminGremiumPage() {
  const { slug = "asta" } = useParams<{ slug: string }>();

  const [page, setPage] = useState<PageDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<PageSectionDTO | null>(null);

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

  function handleSaved(updated: PageSectionDTO | null) {
    if (updated && page) {
      // Replace the edited section in the local state — no refetch needed.
      setPage({
        ...page,
        sections: page.sections.map((s) =>
          s.id === updated.id ? updated : s,
        ),
      });
    }
    setEditing(null);
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

  async function handleAddReferat() {
    try {
      const created = await addReferatSection(slug, {
        subtitle: "Neues Referat",
        body: "Beschreibung hier eintragen…",
      });
      // Reload to pick up the new section + open it for editing right away.
      const fresh = await fetchPage(slug);
      setPage(fresh);
      setEditing(created);
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

  // Find first/last REFERAT positions so we can decide whether to show the
  // up/down arrows on each one (no point showing "up" on the top REFERAT).
  const referateIds = page.sections
    .filter((s) => s.kind === "REFERAT")
    .map((s) => s.id);
  const firstReferatId = referateIds[0];
  const lastReferatId = referateIds[referateIds.length - 1];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{page.title} bearbeiten</h1>
        <p className="text-sm text-gray-600 mt-1">
          Klicke auf das Stift-Symbol oben rechts an einem Abschnitt, um ihn zu
          bearbeiten.
        </p>
      </header>

      <div className="space-y-6">
        {page.sections.map((section) => (
          <EditableSection
            key={section.id}
            onEdit={() => setEditing(section)}
            onMoveUp={
              section.kind === "REFERAT" && section.id !== firstReferatId
                ? () => handleMove(section.id, "up")
                : undefined
            }
            onMoveDown={
              section.kind === "REFERAT" && section.id !== lastReferatId
                ? () => handleMove(section.id, "down")
                : undefined
            }
            onDelete={
              section.kind === "REFERAT"
                ? () => {
                    // Confirmation handled via AlertDialog below — but
                    // for the delete case we render a separate confirm
                    // dialog rather than inline-confirming here. Simpler
                    // is to just call handleDelete and rely on the inline
                    // confirm in EditableSection's host. For now we pop a
                    // native confirm so we don't have to plumb dialog state.
                    if (window.confirm(`„${section.subtitle ?? "Referat"}“ wirklich löschen?`)) {
                      handleDelete(section.id);
                    }
                  }
                : undefined
            }
          >
            {renderSectionByKind(section)}
          </EditableSection>
        ))}
      </div>

      {/* Only ASTA's page can add new sections (Referate). Other pages have
          fixed sets of singleton sections that can't grow. */}
      {slug === "asta" && (
        <div className="border-t border-gray-200 pt-6">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" className="cursor-pointer">
                  + Neues Referat hinzufügen
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogTitle>Neues Referat anlegen?</AlertDialogTitle>
              <AlertDialogDescription>
                Ein neues, leeres Referat wird am Ende der Liste angelegt. Du
                kannst es danach direkt bearbeiten.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddReferat}>
                  Anlegen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <SectionEditorDrawer section={editing} onClose={handleSaved} />
    </div>
  );
}
