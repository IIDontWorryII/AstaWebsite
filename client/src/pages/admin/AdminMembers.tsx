// client/src/pages/admin/AdminMembers.tsx
//
// EDITOR-only "Mitglieder" tool: one place to manage the people shown on the
// gremien pages — AStA referate, StuPa members, and Fachschaft members.
//
// The data still lives in PageSection rows (REFERAT on asta, MEMBER on
// stupa/fachschaften); this is just a focused roster UI over the existing
// section endpoints, so the public pages update automatically.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pencil, Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";
import type { PageDTO, PageSectionDTO } from "../../../../shared/types";
import { fetchPage, deleteSection, moveSection } from "@/lib/pages";
import {
  MEMBER_TABS,
  FACULTIES,
  facultyKey,
  initials,
  memberInFaculty,
  type FacultyKey,
  type MemberTab,
} from "@/lib/members";
import MemberEditorDrawer from "./MemberEditorDrawer";

const SLUGS = MEMBER_TABS.map((t) => t.slug);

type EditorState = {
  open: boolean;
  mode: "new" | "edit";
  tab: MemberTab;
  section: PageSectionDTO | null;
};

/** A blank section used to pre-seed the drawer in "new" mode. */
function blankSection(over: Partial<PageSectionDTO> = {}): PageSectionDTO {
  return {
    id: "",
    order: 0,
    kind: "MEMBER",
    subtitle: null,
    body: null,
    imageUrl: null,
    caption: null,
    email: null,
    ...over,
  };
}

export default function AdminMembers() {
  const [pages, setPages] = useState<Record<string, PageDTO>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(MEMBER_TABS[0].key);
  const [faculty, setFaculty] = useState<FacultyKey | "ALL">("ALL");
  const [editor, setEditor] = useState<EditorState | null>(null);

  const loadAll = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all(SLUGS.map((s) => fetchPage(s)))
      .then((list) => {
        const map: Record<string, PageDTO> = {};
        list.forEach((p) => (map[p.slug] = p));
        setPages(map);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Refetch a single page after an edit so the grid reflects the server.
  const refetch = useCallback((slug: string) => {
    fetchPage(slug)
      .then((p) => setPages((prev) => ({ ...prev, [slug]: p })))
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, []);

  const activeTab = MEMBER_TABS.find((t) => t.key === activeKey) ?? MEMBER_TABS[0];
  const isFachschaft = activeTab.type === "fachschaft";

  // Referat names (from the AStA page) offered as datalist suggestions.
  const roleOptions = useMemo(() => {
    const asta = pages["asta"];
    if (!asta) return [];
    return Array.from(
      new Set(
        asta.sections
          .filter((s) => s.kind === "REFERAT" && s.subtitle)
          .map((s) => s.subtitle as string),
      ),
    );
  }, [pages]);

  // Entries for the active tab (and faculty filter for Fachschaften).
  const entries = useMemo(() => {
    const page = pages[activeTab.slug];
    if (!page) return [];
    let list = page.sections.filter((s) => s.kind === activeTab.kind);
    if (isFachschaft && faculty !== "ALL") {
      list = list.filter((s) => memberInFaculty(s, faculty));
    }
    return list;
  }, [pages, activeTab, isFachschaft, faculty]);

  function openNew() {
    // Pre-select the faculty if the Fachschaft filter is narrowed.
    const seed =
      isFachschaft && faculty !== "ALL"
        ? blankSection({
            subtitle:
              FACULTIES.find((f) => f.key === faculty)?.value ?? null,
          })
        : null;
    setEditor({ open: true, mode: "new", tab: activeTab, section: seed });
  }

  function openEdit(section: PageSectionDTO) {
    setEditor({ open: true, mode: "edit", tab: activeTab, section });
  }

  function handleEditorClose(changed: boolean) {
    const slug = editor?.tab.slug;
    setEditor(null);
    if (changed && slug) refetch(slug);
  }

  async function handleDelete(section: PageSectionDTO) {
    const name = section.caption ?? section.subtitle ?? "Eintrag";
    if (!window.confirm(`„${name}“ wirklich löschen?`)) return;
    try {
      await deleteSection(section.id);
      refetch(activeTab.slug);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    }
  }

  async function handleMove(section: PageSectionDTO, direction: "up" | "down") {
    try {
      const sections = await moveSection(section.id, direction);
      setPages((prev) => ({
        ...prev,
        [activeTab.slug]: { ...prev[activeTab.slug], sections },
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verschieben fehlgeschlagen");
    }
  }

  // Reorder is enabled where members are a single contiguous group (AStA,
  // StuPa). Fachschaft members of both faculties share one page, so up/down
  // there is omitted for now (add via the tool, order by creation).
  const canReorder = !isFachschaft;
  const firstId = entries[0]?.id;
  const lastId = entries[entries.length - 1]?.id;

  return (
    <section className="max-w-5xl mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Mitglieder verwalten</h1>
        <p className="text-sm text-gray-600 mt-1">
          Referate und Mitglieder zentral pflegen — Änderungen erscheinen direkt
          auf den jeweiligen Gremien-Seiten.
        </p>
      </header>

      {/* Gremium tabs. */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {MEMBER_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setActiveKey(t.key);
              setFaculty("ALL");
            }}
            className={`pb-2 -mb-px text-sm font-medium cursor-pointer ${
              t.key === activeKey
                ? "text-asta-red border-b-2 border-asta-red"
                : "text-gray-600 hover:text-asta-red"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Faculty sub-filter (Fachschaften only). */}
      {isFachschaft && (
        <div className="flex gap-2 mb-6">
          <FacultyChip active={faculty === "ALL"} onClick={() => setFaculty("ALL")}>
            Alle
          </FacultyChip>
          {FACULTIES.map((f) => (
            <FacultyChip
              key={f.key}
              active={faculty === f.key}
              onClick={() => setFaculty(f.key)}
            >
              {f.label}
            </FacultyChip>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-600 mb-4" role="alert">
          Fehler: {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Lädt…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {entries.map((section) => (
            <MemberCard
              key={section.id}
              section={section}
              type={activeTab.type}
              onEdit={() => openEdit(section)}
              onDelete={() => handleDelete(section)}
              onUp={
                canReorder && section.id !== firstId
                  ? () => handleMove(section, "up")
                  : undefined
              }
              onDown={
                canReorder && section.id !== lastId
                  ? () => handleMove(section, "down")
                  : undefined
              }
            />
          ))}

          {/* Add card. */}
          <button
            type="button"
            onClick={openNew}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-asta-red hover:text-asta-red transition-colors min-h-[160px] cursor-pointer"
          >
            <Plus className="h-7 w-7" />
            <span className="text-sm">{activeTab.noun} hinzufügen</span>
          </button>
        </div>
      )}

      {editor && (
        <MemberEditorDrawer
          open={editor.open}
          mode={editor.mode}
          type={editor.tab.type}
          slug={editor.tab.slug}
          section={editor.section}
          roleOptions={roleOptions}
          onClose={handleEditorClose}
        />
      )}
    </section>
  );
}

function FacultyChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm border cursor-pointer ${
        active
          ? "bg-asta-red text-white border-asta-red"
          : "bg-white text-gray-700 border-gray-300 hover:border-asta-red"
      }`}
    >
      {children}
    </button>
  );
}

function MemberCard({
  section,
  type,
  onEdit,
  onDelete,
  onUp,
  onDown,
}: {
  section: PageSectionDTO;
  type: MemberTab["type"];
  onEdit: () => void;
  onDelete: () => void;
  onUp?: () => void;
  onDown?: () => void;
}) {
  // Referat cards lead with the referat title; people cards lead with the name.
  const isReferat = type === "referat";
  const primary = isReferat ? section.subtitle : section.caption;
  const secondary = isReferat
    ? section.caption
    : type === "fachschaft"
      ? FACULTIES.find((f) => f.key === facultyKey(section.subtitle))?.label ??
        section.subtitle
      : section.subtitle;

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-4 flex flex-col items-center text-center">
      {/* Edit/delete actions — always visible so they're discoverable on
          touch devices and at a glance (previously hover-only). */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Bearbeiten"
          className="p-1.5 rounded-full bg-white/90 shadow hover:bg-white cursor-pointer"
        >
          <Pencil className="h-4 w-4 text-asta-red" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Löschen"
          className="p-1.5 rounded-full bg-white/90 shadow hover:bg-white cursor-pointer"
        >
          <Trash2 className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Reorder arrows (left side). */}
      {(onUp || onDown) && (
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {onUp && (
            <button
              type="button"
              onClick={onUp}
              aria-label="Nach oben"
              className="p-1 rounded-full bg-white/90 shadow hover:bg-white cursor-pointer"
            >
              <ChevronUp className="h-4 w-4 text-gray-600" />
            </button>
          )}
          {onDown && (
            <button
              type="button"
              onClick={onDown}
              aria-label="Nach unten"
              className="p-1 rounded-full bg-white/90 shadow hover:bg-white cursor-pointer"
            >
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
      )}

      {section.imageUrl ? (
        <img
          src={section.imageUrl}
          alt={primary ?? "Mitglied"}
          loading="lazy"
          className="w-20 h-20 rounded-full object-cover"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-100 grid place-items-center text-lg text-gray-500">
          {initials(section.caption ?? section.subtitle)}
        </div>
      )}
      <p className="font-semibold mt-3 text-sm leading-tight">
        {primary || "—"}
      </p>
      {secondary && (
        <p className="text-xs text-gray-600 mt-0.5">{secondary}</p>
      )}
    </div>
  );
}
