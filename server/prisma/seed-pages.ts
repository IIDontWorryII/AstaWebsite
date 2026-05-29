// server/prisma/seed-pages.ts
//
// Initial data for the Gremien CMS pages, lifted verbatim from the
// hardcoded JSX in client/src/pages/gremien/{Asta,Stupa,Fachschaften}.tsx
// before AW-18 turned that content into editable DB rows.
//
// Seed strategy (see seedPages() below):
//   - Pages are upserted by slug (idempotent — re-runs are safe).
//   - PageSections are seeded ONLY when the page currently has zero
//     sections. This preserves any admin edits made after the initial
//     seed — re-running the seed never wipes them.

import type { PrismaClient } from "@prisma/client";

type SeedSection = {
  kind: "INFO" | "REFERAT" | "MITGLIEDER" | "FREEFORM";
  subtitle?: string;
  body: string;
  imageUrl?: string;
  caption?: string;
  email?: string;
};

type SeedPage = {
  slug: string;
  title: string;
  intro?: string;
  sections: SeedSection[];
};

const ASTA_INFO_BODY =
  "Der Allgemeine Studierendenausschuss (AStA) ist ein Organ der verfassten Studierendenschaft. " +
  "Der AStA wird durch das StudierendenParlament gewählt. Der Remagener AStA ist in verschiedene " +
  "Referate aufgeteilt, die die Aufgabenbereiche des AStA abdecken und sich für die Studierenden " +
  "engagieren. Unser Büro (Raum D 018) ist von Montag bis Freitag in der Mittagspause geöffnet. " +
  "Es kann aber nicht schaden einfach mal vorbei zuschauen, falls ihr ein Problem oder eine Frage " +
  "habt. Der AStA unterteilt sich an unserer Fachhochschule in Referate. Der AStA freut sich stets " +
  "über Mithilfe der Studierenden. Vergesst bitte nie, dass auch wir nur Studierende sind und die " +
  "Aufgaben im AStA neben unserem ganz normalen Studium übernehmen. Warum wir das machen? Ganz " +
  "einfach: Es macht wirklich Spaß und im Endeffekt hat man sogar noch etwas davon… wenn man denn " +
  "seine Aufgaben zufriedenstellend erfüllt. Falls Ihr Interesse habt unser grandioses Team zu " +
  "bereichern, dann sprecht uns einfach an oder schreibt eine Email an rac-asta-vorsitz@rheinahrcampus.de";

const STUPA_INFO_BODY =
  "Wer wir sind? Das Studierendenparlament (StuPa) ist das oberste Aufsichts- und Beschlussgremium " +
  "der studentischen Selbstverwaltung am RheinAhrCampus. Es entscheidet laut Hochschulgesetz in " +
  "grundsätzlichen Angelegenheiten der Studierendenschaft. Das StuPa des RheinAhrCampus versteht " +
  "sich somit als Organ aller Studierenden und fasst Beschlüsse in deren Interesse. Das StuPa setzt " +
  "sich aus 11 Studierenden zusammen, die einmal pro Jahr von der Studierendenschaft als ihre " +
  "Vertreter ausgewählt werden und wird nach außen vertreten von seinem Präsidenten und dessen " +
  "Stellvertreter. Was wir tun? Das StuPa wählt die Vertreter des Allgemeinen Studierendenausschusses " +
  "(AStA), welcher das ausführende Organ der studentischen Selbstverwaltung ist. Zudem beschließt das " +
  "StuPa die Verwendung studentischer Finanzmittel im jährlichen Haushalt und trifft Entscheidungen " +
  "über Finanzanträge und größere Einzelausgaben. Das Studierendenparlament entscheidet über die " +
  "Einrichtung und Änderung von Fachschaften sowie die Beschließung oder Änderung von Satzungen der " +
  "Studierendenschaft. Es ruft Vollversammlungen ein, wenn Entscheidungen getroffen werden müssen, " +
  "die weitreichende Auswirkungen auf alle Studierenden haben. Es ist Ansprechpartner für alle " +
  "Probleme, welche die Studierendenschaft betreffen. Wie wir zu erreichen sind? Zu erreichen ist das " +
  "StuPa per E-Mail (racstupa(at)hs-koblenz.de), sowie über den AStA. Das StuPa tagt regelmäßig " +
  "während der Vorlesungszeit. Die Sitzungen sind öffentlich und jeder Studierende ist herzlich " +
  "eingeladen, auf Probleme hinzuweisen und sich an den Entscheidungen zu beteiligen. Was ihr tun " +
  "könnt? Jeder Studierende, der Interesse hat selbst etwas zu bewegen, kann sich, unabhängig von " +
  "Studiengang und Semester, in das StuPa wählen lassen. Ebenso ist jeder Studierende berechtigt, in " +
  "eigenem Namen oder im Namen von Interessengruppen Anträge zu stellen. Es ist euer Studium und " +
  "euer Campus, also nutzt die Chance etwas zu tun, um die Dinge zu verändern, die ihr anders haben " +
  "wollt.";

const STUPA_MITGLIEDER_BODY =
  "Patrick Maas (Präsident) Simon Knudsen, Leon Schneider, Jens Hidien, Lars Bockheiser, " +
  "Manuel Lenz, Annika Schlag, Lou Stahl, Chiara Vogt, Bastian Langenbach.";

const FACHSCHAFTEN_INFO_BODY =
  "Liebe Studierende, wir, die Fachschaftsräte WISO und MuT, sind dafür zuständig die Interessen der " +
  "Studierenden unseres jeweiligen Fachbereiches zu vertreten und als Ansprechpartner für euch zu " +
  "dienen. Dabei sitzen wir stellvertretend für euch im Fachbereichsrat sowie im Gesamtausschuss der " +
  "FH und setzen uns für eure Interessen und Anliegen ein. Wir helfen euch bei allen Problemen, die " +
  "unseren Fachbereich betreffen, wie z.B. bei eventuellen Problemen mit Dozenten. Weitere " +
  "Informationen über uns und unserer Arbeit findet ihr auf den jeweiligen Seiten!";

const FACHSCHAFTEN_MIT_BODY =
  "Wir als Fachschaft(srat) kümmern uns um die Verwaltung von Klausuren, um die Organisation von " +
  "bestimmten Events und fachspezifischen Informationsveranstaltungen. Außerdem sind wir der " +
  "Ansprechpartner für Professoren und unsere Kommilitonen/-Innen. Bei Fragen, Problemen oder " +
  "Anregungen steht Euch unsere Tür jederzeit offen. Kontakt: fsmut(at)rheinahrcampus.de oder in Raum D013.";

const FACHSCHAFTEN_WISO_BODY =
  "Kennt Ihr das? Gespannt wartet Ihr auf Eure Prüfungsergebnisse oder die Antwort auf eine brennende " +
  "Frage, aber das Prüfungsamt, die Dozenten oder das Sekretariat scheinen ein tibetisches " +
  "Schweigegelübde abgelegt zu haben? Das muss nicht sein! Die Fachschaft WiSo vertritt eure " +
  "Interessen im Fachbereich und kann bei Problemen und Fragen in Zusammenarbeit mit den Mitarbeitern " +
  "und Professoren helfen. Also schmollt nicht zuhause, sondern kommt bei uns im Büro vorbei und wir " +
  "suchen gemeinsam nach einer Lösung. Gerne hören wir uns auch Eure Ideen, Anregungen und " +
  "Verbesserungsvorschläge an. Wo? D012 Wann? Montag bis Freitag, zwischen 13:20 und 14:00 Uhr. Wie? " +
  "Persönlich oder per E-Mail: fswiso(at)rheinahrcampus.de Wir helfen auch bei der Bürokratie, den " +
  "Prüfungsordnungen oder beim Bafög-Antrag. Damit Ihr auch nichts verpasst, haltet die Augen nach " +
  "unseren Plakaten offen oder schaut auf unserer Facebook Seite vorbei! Fachschaft(srat) WiSo " +
  "RheinAhrCampus";

const PAGES: SeedPage[] = [
  {
    slug: "asta",
    title: "AStA",
    sections: [
      {
        kind: "INFO",
        body: ASTA_INFO_BODY,
        imageUrl: "/asta-team.jpg",
      },
      {
        kind: "REFERAT",
        subtitle: "Vorsitz",
        caption: "Alpay Aydin",
        imageUrl: "/referate/alpay-aydin.jpg",
        body:
          "Der Vorsitzende koordiniert die Arbeit des AStA. Er dient als Ansprechpartner für die " +
          "Referenten und jeden, der Fragen zum AStA hat – egal ob Studierender oder nicht. Die " +
          "Leitung der internen AStA-Sitzungen fällt ebenso in seinen Bereich, wie auch die " +
          "Repräsentation nach außen hin. „Nach außen“ will hierbei meinen, dass er den AStA in " +
          "sämtlichen Belangen gegenüber der Fachhochschule, dem Studierendenwerk, den Ministerien " +
          "und der allgemeinen Öffentlichkeit vertritt. Der Vorsitzende arbeitet eng mit den " +
          "verschiedensten Hochschulgremien zusammen und nimmt dabei kritisch und konstruktiv " +
          "Stellung, um die Interessen der Studierendenschaft, also eure Interessen bestmöglich zu " +
          "vertreten. Der Vorsitzende steht euch bei Fragen jeglicher Art immer zur Verfügung. Er " +
          "freut sich immer über Anregungen, Kritik und Unterstützung, was die Arbeit des AStA angeht.",
        email: "rac-asta-vorsitz@rheinahrcampus.de",
      },
      {
        kind: "REFERAT",
        subtitle: "Finanz-Referat",
        caption: "Jonathan Vogel, Justus Wiegand",
        imageUrl: "/referate/finanz-referat.jpg",
        body:
          "Die Finanzen der Studierendenschaft werden vom Finanzreferat kontrolliert und verwaltet. " +
          "Die Aufgaben sind die korrekte Buchführung, das Haushalten mit den gegebenen Mitteln und " +
          "das Verwalten der finanziellen Vorgänge. Das Finanzreferat erstellt Rechnungen, tätigt " +
          "Überweisungen und erstellt zu Beginn eines jeden Jahres den Jahresabschluss, sowie zum " +
          "Ende des Jahres gemeinsam mit den anderen Referaten den Haushaltsplan für das kommende Jahr.",
        email: "rac-asta-finanzen@rheinahrcampus.de",
      },
      {
        kind: "REFERAT",
        subtitle: "Event-Referat",
        caption: "Annika Kopf, Luisa Schmidt",
        imageUrl: "/referate/event-referat.jpg",
        body:
          "Das Eventreferat organisiert die großen Partys, die euch während des Semesters die " +
          "dringend benötigte Abwechslung vom Vorlesungsalltag bringen. Neben der Ersti-Party in der " +
          "Recreation Area zum Semesterstart findet jedes Jahr die legendäre Pool Party im Freibad " +
          "nebenan statt und zum Ende des Jahres die Xmas-Party… die jeder RAC Student einmal " +
          "miterlebt haben muss! Wenn ihr euch engagieren wollt, ob kurz- oder langfristig, scheut " +
          "euch nicht und nehmt Kontakt mit dem Eventreferat auf.",
        email: "rac-asta-event@rheinahrcampus.de",
      },
      {
        kind: "REFERAT",
        subtitle: "Sport-Referat",
        caption: "Antonia Adams, Evelyn Oster",
        imageUrl: "/referate/sport-referat.jpg",
        body:
          "Der Hochschulsport des RheinAhrCampus wird vom Sportreferat organisiert und betreut. " +
          "Interessenten finden bei uns die Möglichkeit von Fußball über Basketball, bis hin zum " +
          "Laufen auf ein vielfältiges Sportangebot zurückzugreifen. Alle Termine zu den einzelnen " +
          "Angeboten findet ihr an unserer Sportwand im Mensa-Vorraum, auf Social Media oder hier. " +
          "Solltet ihr euren Lieblingssport vermissen, euch gerne als Trainer oder Übungsleiter für " +
          "einen Bereich engagieren wollen oder einfach nur Anregungen für die Organisation des " +
          "Hochschulsports haben, so meldet euch bei uns. Das Sport-Team organisiert auch alles rund " +
          "um unseren großen Sandkasten. Das sind vor allem die legendären Turniere im Sommersemester, " +
          "sowie die Verwaltung des Beach-Courts und der Verleih von Sportmaterialien.",
        email: "rac-asta-sport@rheinahrcampus.de",
      },
      {
        kind: "REFERAT",
        subtitle: "Medien-Referat",
        caption: "Jonathan Vogel",
        imageUrl: "/referate/medien-referat.jpg",
        body:
          "Das Medienreferat kümmert sich um die Außendarstellung des AStA, betreut die " +
          "Social-Media-Kanäle (Instagram, TikTok) und sorgt dafür, dass Events, Sitzungen und " +
          "Informationen bei den Studierenden ankommen. Wenn du Lust hast, an Plakaten, Videos oder " +
          "Social-Media-Posts mitzuwirken, schreib uns gerne eine Mail.",
        email: "rac-asta-medien@rheinahrcampus.de",
      },
      {
        kind: "REFERAT",
        subtitle: "Nachhaltigkeits-Referat",
        caption: "(TODO — Name aktualisieren)",
        imageUrl: "/referate/nachhaltigkeit-referat.jpg",
        body:
          "Das Nachhaltigkeitsreferat engagiert sich für eine umweltbewusste Gestaltung des " +
          "Hochschulalltags am RheinAhrCampus. Dazu gehören Informationsveranstaltungen, Workshops, " +
          "nachhaltige Projekte und Aktionen, die nachhaltiges Denken und ressourcenschonendes " +
          "Handeln fördern. Im Mittelpunkt stehen die Sensibilisierung für ökologische Themen, das " +
          "bewusste Erleben von Natur und die konkrete Umsetzung nachhaltiger Ansätze — auf dem " +
          "Campus und darüber hinaus. Wenn du Ideen oder Anregungen für die Weiterentwicklung " +
          "nachhaltiger Strukturen oder für eine umweltbewusstere Gestaltung hast oder dich aktiv an " +
          "der Umsetzung beteiligen möchtest, schreibe uns gerne eine E-Mail oder sprich uns " +
          "persönlich an. Wir freuen uns auf den Austausch.",
        email: "rac-asta-nachhaltigkeit@rheinahrcampus.de",
      },
      {
        kind: "REFERAT",
        subtitle: "BaRACke-Referat",
        caption: "Niels Dieck, Jonas Romberg, Amelie …",
        imageUrl: "/referate/baracke-referat.jpg",
        body:
          "In der Remagener Innenstadt findet ihr unseren Studierendentreffpunkt „Baracke“. Neben " +
          "den regulären Öffnungszeiten, in denen man sich auf das ein oder andere Getränk treffen " +
          "kann, finden dort regelmäßig Events statt. Das Referat Studierendentreffpunkt ist unter " +
          "anderem für folgende Aufgaben in der BaRACke zuständig: Personal zu beschaffen, " +
          "Personalplan erstellen, Getränke-Kalkulationen erstellen, Getränke bestellen, " +
          "Öffentlichkeitsarbeit (Zusammenarbeit mit Presse, offizielle Gespräche mit Stadt, " +
          "Hochschule, etc.), Sponsorenakquise und -betreuung, Renovierungsarbeiten und " +
          "Eventorganisation. Aber auch Nicht-Referenten können sich sehr gerne in der Baracke als " +
          "ehrenamtliches Thekenpersonal engagieren. Wenn ihr also Lust habt, in einem tollen Team " +
          "zu arbeiten, meldet euch bei uns. Mehr Infos findet ihr hier.",
        email: "rac-asta-baracke@rheinahrcampus.de",
      },
    ],
  },
  {
    slug: "stupa",
    title: "StuPa",
    sections: [
      { kind: "INFO", body: STUPA_INFO_BODY },
      {
        kind: "MITGLIEDER",
        subtitle: "Mitglieder",
        body: STUPA_MITGLIEDER_BODY,
        imageUrl: "/stupa-team.jpg",
      },
    ],
  },
  {
    slug: "fachschaften",
    title: "Fachschaften",
    sections: [
      { kind: "INFO", body: FACHSCHAFTEN_INFO_BODY },
      { kind: "FREEFORM", subtitle: "MIT", body: FACHSCHAFTEN_MIT_BODY },
      { kind: "FREEFORM", subtitle: "WiSo", body: FACHSCHAFTEN_WISO_BODY },
    ],
  },
];

/**
 * Upsert each page by slug, then only create its sections if NONE exist
 * yet. This preserves any admin edits across re-runs of the seed — the
 * first run populates everything, subsequent runs leave content alone.
 */
export async function seedPages(prisma: PrismaClient): Promise<number> {
  let createdSections = 0;
  for (const pageData of PAGES) {
    const page = await prisma.page.upsert({
      where: { slug: pageData.slug },
      update: { title: pageData.title, intro: pageData.intro ?? null },
      create: {
        slug: pageData.slug,
        title: pageData.title,
        intro: pageData.intro ?? null,
      },
    });

    const existing = await prisma.pageSection.count({
      where: { pageId: page.id },
    });
    if (existing > 0) continue;

    for (let i = 0; i < pageData.sections.length; i++) {
      const s = pageData.sections[i];
      await prisma.pageSection.create({
        data: {
          order: i,
          kind: s.kind,
          subtitle: s.subtitle ?? null,
          body: s.body,
          imageUrl: s.imageUrl ?? null,
          caption: s.caption ?? null,
          email: s.email ?? null,
          pageId: page.id,
        },
      });
      createdSections++;
    }
  }
  return createdSections;
}
