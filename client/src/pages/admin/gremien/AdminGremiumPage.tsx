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
import type {
  PageDTO,
  PageSectionDTO,
  PageSectionKind,
} from "../../../../../shared/types";
import { addSection, deleteSection, fetchPage, moveSection } from "@/lib/pages";
import InfoSection from "@/components/gremien/InfoSection";
import ReferatCard from "@/components/gremien/ReferatCard";
import MitgliederSection from "@/components/gremien/MitgliederSection";
import FreeformSection from "@/components/gremien/FreeformSection";
import MemberCard from "@/components/gremien/MemberCard";
import MenuCard from "@/components/gremien/MenuCard";
import GalleryCard from "@/components/gremien/GalleryCard";
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
import HeroImageEditor from "./HeroImageEditor";

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
    case "MENU":
      return <MenuCard section={section} />;
    case "GALLERY":
      return <GalleryCard section={section} />;
  }
}

/** Kinds the editor can add/reorder/delete freely (multi-instance). */
const REORDERABLE: ReadonlySet<PageSectionKind> = new Set([
  "REFERAT",
  "MEMBER",
  "MENU",
  "GALLERY",
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
  asta: [
    {
      label: "+ Neues Referat hinzufügen",
      kind: "REFERAT",
      placeholder: "Neues Referat",
      initial: { subtitle: "Neues Referat", body: "Beschreibung hier eintragen…" },
    },
  ],
  stupa: [
    {
      label: "+ Neues Mitglied hinzufügen",
      kind: "MEMBER",
      placeholder: "Neues Mitglied",
      initial: { subtitle: "Neues Mitglied", caption: "Name eintragen" },
    },
  ],
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

  async function handleAdd(config: AddConfig) {
    try {
      const created = await addSection(slug, config.kind, config.initial ?? {});
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
          Klicke auf das Stift-Symbol oben rechts an einem Abschnitt, um ihn zu
          bearbeiten.
        </p>
      </header>

      <HeroImageEditor
        slug={slug}
        currentUrl={page.heroImageUrl}
        onUpdated={setPage}
      />

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

      {/* Pages with entries in ADD_CONFIG get "add new section" button(s).
          ASTA → Referat, STUPA → Mitglied, BaRACke → Menü/Galerie. */}
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

      <SectionEditorDrawer section={editing} onClose={handleSaved} />
    </div>
  );
}
