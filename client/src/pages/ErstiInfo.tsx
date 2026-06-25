// client/src/pages/ErstiInfo.tsx
//
// Public "Ersti-Info" page: a launchpad of the most useful platforms plus the
// practical knowledge every newcomer at the RheinAhrCampus picks up — first
// steps, deadlines, insider tips, who to ask, a glossary and an FAQ.
//
// The "Erste Schritte" steps, the FAQ and the "Fristen & Termine" block are
// editor-managed (Seiteninhalte → Ersti-Info) and loaded from the API; the
// launchpad, insider tips, glossary and help cards are static.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Megaphone,
  Printer,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { ErstiInfoDTO, PageSectionDTO } from "../../../shared/types";
import { fetchPage } from "@/lib/pages";
import { fetchErsti } from "@/lib/ersti";
import PageHero from "@/components/PageHero";
import Band from "@/components/Band";
import SectionHeader from "@/components/SectionHeader";
import RichText from "@/components/RichText";
import { SOCIAL_LINKS } from "@/lib/socials";

const HS_HOME = "https://www.hs-koblenz.de/home";

interface QuickLink {
  name: string;
  desc: string;
  href: string;
  Icon: LucideIcon;
}

const QUICK_LINKS: QuickLink[] = [
  {
    name: "OLAT",
    desc: "Lernmaterialien & Modulanmeldung",
    href: "https://olat.vcrp.de/dmz/",
    Icon: BookOpen,
  },
  {
    name: "SoGo",
    desc: "Deine Uni-Mail – hier kommt alles Wichtige an",
    href: "https://sogo.hs-koblenz.de/SOGo/so",
    Icon: Mail,
  },
  {
    name: "ICMS",
    desc: "Prüfungen, Noten & Bescheinigungen",
    href: "https://icms.hs-koblenz.de/",
    Icon: ClipboardList,
  },
  {
    name: "HS Koblenz",
    desc: "Offizielle Website der Hochschule",
    href: HS_HOME,
    Icon: Globe,
  },
];

interface Tip {
  Icon: LucideIcon;
  title: string;
  text: string;
}

const TIPS: Tip[] = [
  {
    Icon: MapPin,
    title: "Raumnummern verstehen",
    text: "Die Nummern verraten Gebäude und Etage. Im Zweifel hilft die Infotheke oder deine Fachschaft weiter.",
  },
  {
    Icon: UtensilsCrossed,
    title: "Mensa",
    text: "Günstig essen mit der Mensacard – einfach am Automaten aufladen und bargeldlos zahlen.",
  },
  {
    Icon: FileText,
    title: "Altklausuren",
    text: "Alte Klausuren zum Üben bekommst du oft bei deiner Fachschaft (MIT / WiSo).",
  },
  {
    Icon: Printer,
    title: "Drucken & Kopieren",
    text: "An den Hochschul-Druckern druckst, kopierst und scannst du mit deinem Account.",
  },
  {
    Icon: Megaphone,
    title: "Bleib auf dem Laufenden",
    text: "Folge dem AStA auf Instagram & TikTok und tritt den Ersti-Gruppen deines Studiengangs bei.",
  },
  {
    Icon: CalendarClock,
    title: "Ersti-Woche & Events",
    text: "Lern den Campus und neue Leute bei den Erstsemester-Veranstaltungen kennen.",
  },
];

interface HelpItem {
  title: string;
  text: string;
  to?: string;
  href?: string;
}

const HELP: HelpItem[] = [
  {
    title: "AStA & BaRACke",
    text: "Deine Studierendenvertretung – Fragen, Hilfe und der Kneipenabend in der BaRACke.",
    to: "/baracke",
  },
  {
    title: "Fachschaften MIT & WiSo",
    text: "Erste Anlaufstelle für alles Fachliche – und für Altklausuren.",
    to: "/gremien/fachschaften",
  },
  {
    title: "StuPa",
    text: "Das Studierendenparlament der verfassten Studierendenschaft.",
    to: "/gremien/stupa",
  },
  {
    title: "Prüfungsamt & Sekretariat",
    text: "An-/Abmeldungen, Bescheinigungen und Formalitäten rund ums Studium.",
    href: HS_HOME,
  },
  {
    title: "Studienberatung",
    text: "Unsicher im Studium oder bei der Studienwahl? Hier wird beraten.",
    href: HS_HOME,
  },
  {
    title: "Studierendenwerk",
    text: "BAföG, Wohnen, Mensa und soziale Beratung.",
    href: HS_HOME,
  },
];

const GLOSSARY: [string, string][] = [
  ["ECTS / CP", "Credit Points – Leistungspunkte pro Modul, rund 30 pro Semester."],
  ["SWS", "Semesterwochenstunden – Stunden pro Woche für eine Lehrveranstaltung."],
  ["Modul", "Eine thematische Lehreinheit, die meist mit einer Prüfung abschließt."],
  ["PO", "Prüfungsordnung – die verbindlichen Regeln deines Studiengangs."],
  ["Rückmeldung", "Anmeldung fürs nächste Semester – erfolgt durch Zahlung des Semesterbeitrags."],
  ["Exmatrikulation", "Abmeldung von der Hochschule, z. B. wenn die Rückmeldung fehlt."],
  ["Regelstudienzeit", "Die vorgesehene Anzahl Semester bis zu deinem Abschluss."],
  ["AStA / StuPa / FS", "Deine studentischen Gremien (siehe „Wo bekomme ich Hilfe?“)."],
];

export default function ErstiInfo() {
  const [steps, setSteps] = useState<PageSectionDTO[]>([]);
  const [faqs, setFaqs] = useState<PageSectionDTO[]>([]);
  const [fristen, setFristen] = useState<ErstiInfoDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPage("ersti"), fetchErsti()])
      .then(([page, info]) => {
        setSteps(page.sections.filter((s) => s.kind === "STEP"));
        setFaqs(page.sections.filter((s) => s.kind === "FAQ"));
        setFristen(info);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"));
  }, []);

  return (
    <div>
      <PageHero
        image="/campus-photo.jpg"
        title="Ersti-Info"
        subtitle="Neu am RheinAhrCampus? Alles Wichtige an einem Ort."
      />

      {/* Launchpad — an elevated card directly below the hero. */}
      <section className="mx-auto max-w-7xl px-6 pt-10 md:pt-12">
        <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ name, desc, href, Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-xl p-4 transition hover:bg-asta-red/5"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-asta-red/10 text-asta-red">
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-semibold">
                  {name}
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-0.5 block text-sm text-gray-600">{desc}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {error && (
        <Band>
          <p className="text-red-600">Fehler: {error}</p>
        </Band>
      )}

      {/* Erste Schritte (2/3) paired with Fristen & Termine (1/3). */}
      <Band id="erste-schritte">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionHeader
              title="Deine ersten Schritte"
              subtitle="Hak ab, was du schon erledigt hast – dein Fortschritt bleibt auf diesem Gerät gespeichert."
            />
            {steps.length > 0 ? (
              <StepsChecklist steps={steps} />
            ) : (
              <p className="text-gray-500">Noch keine Schritte hinterlegt.</p>
            )}
          </div>

          <div id="fristen">
            <SectionHeader title="Fristen & Termine" />
            <FristenCard fristen={fristen} />
          </div>
        </div>
      </Band>

      {/* Insider tips. */}
      <Band id="tipps" alt>
        <SectionHeader title="Insider-Tipps" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-asta-red/10 text-asta-red">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-gray-600">
          Folg uns:{" "}
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="font-medium text-asta-red hover:underline">
            Instagram
          </a>{" "}
          ·{" "}
          <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="font-medium text-asta-red hover:underline">
            TikTok
          </a>
        </p>
      </Band>

      {/* Who to ask. */}
      <Band id="hilfe">
        <SectionHeader
          title="Wo bekomme ich Hilfe?"
          subtitle="Du musst nichts allein herausfinden – das sind deine Anlaufstellen."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HELP.map((item) => (
            <HelpCard key={item.title} item={item} />
          ))}
        </div>
      </Band>

      {/* FAQ (2-up) + glossary. */}
      {faqs.length > 0 && (
        <Band id="faq" alt>
          <SectionHeader title="Häufige Fragen" />
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map((f) => (
              <details key={f.id} className="group rounded-lg border border-gray-200 bg-white p-4">
                <summary className="flex cursor-pointer items-center justify-between font-medium">
                  {f.subtitle ?? "Frage"}
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-90" />
                </summary>
                <RichText html={f.body ?? ""} className="prose-sm mt-2" />
              </details>
            ))}
          </div>
        </Band>
      )}

      <Band id="glossar">
        <SectionHeader
          title="Uni-Vokabular"
          subtitle="Die Abkürzungen, die am Anfang alle verwirren."
        />
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {GLOSSARY.map(([term, def]) => (
            <div key={term}>
              <dt className="font-semibold">{term}</dt>
              <dd className="text-sm text-gray-600">{def}</dd>
            </div>
          ))}
        </dl>
      </Band>
    </div>
  );
}

const STORAGE_KEY = "ersti-erste-schritte-done";

function StepsChecklist({ steps }: { steps: PageSectionDTO[] }) {
  const [doneIds, setDoneIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doneIds));
    } catch {
      // storage unavailable (private mode) — progress just won't persist
    }
  }, [doneIds]);

  function toggle(id: string) {
    setDoneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <ol className="space-y-2">
      {steps.map((s) => {
        const done = doneIds.includes(s.id);
        return (
          <li key={s.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-asta-red">
              <input
                type="checkbox"
                checked={done}
                onChange={() => toggle(s.id)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-asta-red cursor-pointer"
              />
              <span className={done ? "line-through opacity-50" : ""}>
                <RichText html={s.body ?? ""} className="prose-sm prose-p:my-0 text-gray-800" />
              </span>
            </label>
          </li>
        );
      })}
    </ol>
  );
}

function FristenCard({ fristen }: { fristen: ErstiInfoDTO | null }) {
  const fallback = "Wird noch bekannt gegeben.";
  return (
    <div className="rounded-2xl border-l-4 border-asta-red bg-gray-50 p-6">
      <dl className="space-y-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Prüfungsanmeldung
          </dt>
          <dd className="text-gray-800">
            {fristen?.pruefungsanmeldung || fallback}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Klausurenphase
          </dt>
          <dd className="text-gray-800">
            {fristen?.klausurenphase || fallback}
          </dd>
        </div>
      </dl>

      {(fristen?.pruefungstermineMitUrl || fristen?.pruefungstermineWisoUrl) && (
        <div className="mt-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Prüfungstermine
          </p>
          {fristen?.pruefungstermineMitUrl && (
            <PdfLink href={fristen.pruefungstermineMitUrl} label="Fachbereich MIT" />
          )}
          {fristen?.pruefungstermineWisoUrl && (
            <PdfLink href={fristen.pruefungstermineWisoUrl} label="Fachbereich WiSo" />
          )}
        </div>
      )}
    </div>
  );
}

function PdfLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:border-asta-red hover:text-asta-red"
    >
      <Download className="h-4 w-4" />
      {label} (PDF)
    </a>
  );
}

function HelpCard({ item }: { item: HelpItem }) {
  const inner = (
    <>
      <h3 className="flex items-center gap-1 font-semibold">
        {item.title}
        {item.href ? (
          <ExternalLink className="h-3.5 w-3.5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
        ) : (
          <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </h3>
      <p className="mt-1 text-sm text-gray-600">{item.text}</p>
    </>
  );

  const className =
    "group block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-asta-red hover:shadow-sm";

  return item.to ? (
    <Link to={item.to} className={className}>
      {inner}
    </Link>
  ) : (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  );
}
