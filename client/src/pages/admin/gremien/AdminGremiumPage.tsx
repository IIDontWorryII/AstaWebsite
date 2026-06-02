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
  addMemberSection,
  deleteSection,
  fetchPage,
  moveSection,
} from "@/lib/pages";
import InfoSection from "@/components/gremien/InfoSection";
import ReferatCard from "@/components/gremien/ReferatCard";
import MitgliederSection from "@/components/gremien/MitgliederSection";
import FreeformSection from "@/components/gremien/FreeformSection";
import MemberCard from "@/components/gremien/MemberCard";
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
    case "MEMBER":
      return <MemberCard section={section} />;
  }
}

/**
 * Config for the "add a new section" button per page slug. Pages without
 * an entry here don't get an add button (all their sections are singletons).
 */
const ADD_CONFIG: Record<
  string,
  { label: string; kind: "REFERAT" | "MEMBER"; placeholder: string }
> = {
  asta: {
    label: "+ Neues Referat hinzufügen",
    kind: "REFERAT",
    placeholder: "Neues Referat",
  },
  stupa: {
    label: "+ Neues Mitglied hinzufügen",
    kind: "MEMBER",
    placeholder: "Neues Mitglied",
  },
};

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

  async function handleAdd() {
    const config = ADD_CONFIG[slug];
    if (!config) return;
    try {
      const created =
        config.kind === "REFERAT"
          ? await addReferatSection(slug, {
              subtitle: config.placeholder,
              body: "Beschreibung hier eintragen…",
            })
          : await addMemberSection(slug, {
              subtitle: config.placeholder,
              caption: "Name eintragen",
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

  // Both REFERAT and MEMBER are reorderable kinds — find the first/last
  // of each so we can decide whether to show up/down arrows.
  const referateIds = page.sections
    .filter((s) => s.kind === "REFERAT")
    .map((s) => s.id);
  const firstReferatId = referateIds[0];
  const lastReferatId = referateIds[referateIds.length - 1];
  const memberIds = page.sections
    .filter((s) => s.kind === "MEMBER")
    .map((s) => s.id);
  const firstMemberId = memberIds[0];
  const lastMemberId = memberIds[memberIds.length - 1];

  function canMoveUp(section: PageSectionDTO): boolean {
    if (section.kind === "REFERAT") return section.id !== firstReferatId;
    if (section.kind === "MEMBER") return section.id !== firstMemberId;
    return false;
  }
  function canMoveDown(section: PageSectionDTO): boolean {
    if (section.kind === "REFERAT") return section.id !== lastReferatId;
    if (section.kind === "MEMBER") return section.id !== lastMemberId;
    return false;
  }
  function canDelete(section: PageSectionDTO): boolean {
    // REFERAT/MEMBER are multi-instance and freely deletable. MITGLIEDER is
    // a legacy STUPA text block we've replaced with member cards — allow
    // deleting it so editors can remove the leftover.
    return (
      section.kind === "REFERAT" ||
      section.kind === "MEMBER" ||
      section.kind === "MITGLIEDER"
    );
  }

  const addConfig = ADD_CONFIG[slug];

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
                    // dialog state per row. Upgrade to AlertDialog if AStA
                    // complains it's ugly.
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
          >
            {renderSectionByKind(section)}
          </EditableSection>
        ))}
      </div>

      {/* Pages with an entry in ADD_CONFIG get an "add new section" button.
          ASTA → Referat, STUPA → Mitglied. Fachschaften has none. */}
      {addConfig && (
        <div className="border-t border-gray-200 pt-6">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" className="cursor-pointer">
                  {addConfig.label}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogTitle>{addConfig.placeholder} anlegen?</AlertDialogTitle>
              <AlertDialogDescription>
                Ein neuer leerer Abschnitt wird am Ende der Liste angelegt. Du
                kannst ihn danach direkt bearbeiten.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleAdd}>
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
