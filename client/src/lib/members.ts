// client/src/lib/members.ts
//
// Shared config + helpers for the admin "Mitglieder" tool and the public
// Fachschaften page. Members aren't a separate data type — they're PageSection
// rows: AStA referate are REFERAT sections, StuPa + Fachschaft people are
// MEMBER sections. This module centralizes how we group/label them.

import type { PageSectionDTO } from "../../../shared/types";

/** Which editor form a roster entry uses. */
export type MemberType = "referat" | "member" | "fachschaft";

/** One tab in the admin member tool. */
export interface MemberTab {
  key: string;
  label: string;
  /** Gremium page the entries live on. */
  slug: string;
  /** Section kind that represents a person on that page. */
  kind: "REFERAT" | "MEMBER";
  type: MemberType;
  /** Noun for the "+ … hinzufügen" / drawer title ("Referat" / "Mitglied"). */
  noun: string;
}

export const MEMBER_TABS: MemberTab[] = [
  {
    key: "asta",
    label: "AStA Referate",
    slug: "asta",
    kind: "REFERAT",
    type: "referat",
    noun: "Referat",
  },
  {
    key: "stupa",
    label: "StuPa",
    slug: "stupa",
    kind: "MEMBER",
    type: "member",
    noun: "Mitglied",
  },
  {
    key: "fachschaften",
    label: "Fachschaften",
    slug: "fachschaften",
    kind: "MEMBER",
    type: "fachschaft",
    noun: "Mitglied",
  },
];

/**
 * Faculties a Fachschaft member can belong to. The `value` is stored verbatim
 * in the MEMBER section's `subtitle`; `key` is the canonical token we match on
 * (case-insensitively, by substring) so it lines up with the FREEFORM band
 * subtitles ("FS MIT", "FS WiSo") already on the page.
 */
export const FACULTIES = [
  { key: "MIT", value: "FS MIT", label: "FS MIT" },
  { key: "WISO", value: "FS WiSo", label: "FS WiSo" },
] as const;

export type FacultyKey = (typeof FACULTIES)[number]["key"];

/**
 * Map a free-text subtitle (member subtitle or FREEFORM heading) to a faculty
 * key, or null if it matches none. WiSo is checked first because "FS WiSo"
 * also contains no "mit"/"mut", but order keeps it explicit.
 */
export function facultyKey(subtitle: string | null | undefined): FacultyKey | null {
  const s = (subtitle ?? "").toLowerCase();
  if (s.includes("wiso")) return "WISO";
  if (s.includes("mit") || s.includes("mut")) return "MIT";
  return null;
}

/** True when a member section belongs to the given faculty. */
export function memberInFaculty(
  section: PageSectionDTO,
  faculty: FacultyKey,
): boolean {
  return facultyKey(section.subtitle) === faculty;
}

/** Initials for the avatar fallback when a person has no photo. */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
