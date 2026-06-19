// client/src/pages/gremien/Fachschaften.tsx
//
// Public Fachschaften page: hero + Info + one alternating band per
// Fachschaft (MIT / WiSo). Each FREEFORM section gets its anchor id from a
// slug of its subtitle (#mit / #wiso) and its logo from the public folder.

import { useEffect, useState } from "react";
import type { PageDTO } from "../../../../shared/types";
import { fetchPage } from "@/lib/pages";
import PageHero from "@/components/PageHero";
import Band from "@/components/Band";
import InfoSection from "@/components/gremien/InfoSection";
import FreeformSection from "@/components/gremien/FreeformSection";
import MemberCard from "@/components/gremien/MemberCard";
import { facultyKey } from "@/lib/members";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function Fachschaften() {
  const [page, setPage] = useState<PageDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage("fachschaften")
      .then(setPage)
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-red-600">Fehler: {error}</p>
      </div>
    );
  }
  if (!page) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-gray-500">Lädt…</p>
      </div>
    );
  }

  const info = page.sections.find((s) => s.kind === "INFO");
  const freeforms = page.sections.filter((s) => s.kind === "FREEFORM");
  const members = page.sections.filter((s) => s.kind === "MEMBER");

  return (
    <div>
      <PageHero
        image={page.heroImageUrl ?? "/fachschaft-hero.jpg"}
        title="Fachschaften"
        subtitle="Deine Vertretung im Fachbereich"
        logoLeft="/MIT-logo.png"
        logoRight="/WiSo-Logo.png"
        centerTitle
      />

      {info && (
        <Band id="info">
          <InfoSection section={info} title="Über die Fachschaften" textOnly />
        </Band>
      )}

      {freeforms.map((s, i) => {
        // Members tagged with this band's faculty (FS MIT / FS WiSo) become the
        // band's second column, alternating sides so the page stays lively.
        const bandFaculty = facultyKey(s.subtitle);
        const bandMembers = bandFaculty
          ? members.filter((m) => facultyKey(m.subtitle) === bandFaculty)
          : [];
        const memberGrid =
          bandMembers.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-4 gap-y-8 justify-items-center">
              {bandMembers.map((m) => (
                <MemberCard key={m.id} section={m} hideSubtitle compact />
              ))}
            </div>
          ) : undefined;
        return (
          <Band key={s.id} id={slugify(s.subtitle ?? s.id)} alt={i % 2 === 0}>
            <FreeformSection
              section={s}
              imageRight={i % 2 === 1}
              aside={memberGrid}
            />
          </Band>
        );
      })}
    </div>
  );
}
