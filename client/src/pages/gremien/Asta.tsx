// components/pages/gremien/Asta.tsx

// TODO Step 13/14 — migrate this hardcoded content to admin-editable
// fields backed by the API. See AW-2 epic.

const astaReferate = [
  {
    title: "Vorsitz",
    holder: "Alpay Aydin",
    photo: "/referate/alpay-aydin.jpg",
    description:
      "Der Vorsitzende koordiniert die Arbeit des AStA. Er dient als Ansprechpartner für die Referenten und jeden, der Fragen zum AStA hat – egal ob Studierender oder nicht. Die Leitung der internen AStA-Sitzungen fällt ebenso in seinen Bereich, wie auch die Repräsentation nach außen hin.“Nach außen” will hierbei meinen, dass er den AStA in sämtlichen Belangen gegenüber der Fachhochschule, dem Studierendenwerk, den Ministerien und der allgemeinen Öffentlichkeit vertritt. Der Vorsitzende arbeitet eng mit den verschiedensten Hochschulgremien zusammen und nimmt dabei kritisch und konstruktiv Stellung, um die Interessen der Studierendenschaft, also eure Interessen bestmöglich zu vertreten. Der Vorsitzende steht euch bei Fragen jeglicher Art immer zur Verfügung. Er freut sich immer über Anregungen, Kritik und Unterstützung, was die Arbeit des AStA angeht.",
    email: "rac-asta-vorsitz@rheinahrcampus.de",
  },
  {
    title: "Finanz-Referat",
    holder: "Jonathan Vogel, Justus Wiegand",
    photo: "/referate/finanz-referat.jpg",
    description:
      "Die Finanzen der Studierendenschaft werden vom Finanzreferat kontrolliert und verwaltet.Die Aufgaben sind die korrekte Buchführung, das Haushalten mit den gegebenen Mitteln und das Verwalten der finanziellen Vorgänge. Das Finanzreferat erstellt Rechnungen, tätigt Überweisungen und erstellt zu Beginn eines jeden Jahres den Jahresabschluss, sowie zum Ende des Jahres gemeinsam mit den anderen Referaten den Haushaltsplan für das kommende Jahr.",
    email: "rac-asta-finanzen@rheinahrcampus.de",
  },
  // TODO: update PKS Referat info
  {
    title: "PKS TODO!!!",
    holder: "Jonathan Vogel",
    photo: "/referate/jonathan-vogel.jpg",
    description:
      "Die Finanzen der Studierendenschaft werden vom Finanzreferat kontrolliert und verwaltet ...",
    email: "rac-asta-finanzen@rheinahrcampus.de",
  },

  {
    title: "Event-Referat",
    holder: "Annika Kopf, Luisa Schmidt",
    photo: "/referate/event-referat.jpg",
    description:
      "Das Eventreferat organisiert die großen Partys, die euch während des Semesters die dringend benötigte Abwechslung vom Vorlesungsalltag bringen. Neben der Ersti-Party in der Recreation Area zum Semesterstart findet jedes Jahr die legendäre Pool Party im Freibad nebenan statt und zum Ende des Jahres die Xmas-Party... die jeder RAC Student einmal miterlebt haben muss! Wenn ihr euch engagieren wollt, ob kurz - oder langfristig, scheut euch nicht und nehmt Kontakt mit dem Eventreferat auf.",
    email: "rac-asta-event(at)rheinahrcampus.de",
  },
  {
    title: "Sport-Referat",
    holder: "Antonia Adams, Evelyn Oster ",
    photo: "/referate/sport-referat.jpg",
    description:
      "Der Hochschulsport des RheinAhrCampus wird vom Sportreferat organisiert und betreut. Interessenten finden bei uns die Möglichkeit von Fußball über Basketball, bis hin zum Laufen auf ein vielfältiges Sportangebot zurückzugreifen. Alle Termine zu den einzelnen Angeboten findet ihr an unserer Sportwand im Mensa-Vorraum, auf Social Media oder hier. Solltet ihr euren Lieblingssport vermissen, euch gerne als Trainer oder Übungsleiter für einen Bereich engagieren wollen oder einfach nur Anregungen für die Organisation des Hochschulsports haben, so meldet euch bei uns. Das Sport-Team organisiert auch alles rund um unseren großen Sandkasten. Das sind vor allem die legendären Turniere im Sommersemester, sowie die Verwaltung des Beach-Courts und der Verleih von Sportmaterialien.",
    email: "rac-asta-sport@rheinahrcampus.de",
  },
  {
    title: "Medien-Referat",
    holder: "Jonathan Vogel",
    photo: "/referate/medien-referat.jpg",
    description:
      "Der Hochschulsport des RheinAhrCampus wird vom Sportreferat organisiert und betreut. Interessenten finden bei uns die Möglichkeit von Fußball über Basketball, bis hin zum Laufen auf ein vielfältiges Sportangebot zurückzugreifen. Alle Termine zu den einzelnen Angeboten findet ihr an unserer Sportwand im Mensa-Vorraum, auf Social Media oder hier. Solltet ihr euren Lieblingssport vermissen, euch gerne als Trainer oder Übungsleiter für einen Bereich engagieren wollen oder einfach nur Anregungen für die Organisation des Hochschulsports haben, so meldet euch bei uns. Das Sport-Team organisiert auch alles rund um unseren großen Sandkasten. Das sind vor allem die legendären Turniere im Sommersemester, sowie die Verwaltung des Beach-Courts und der Verleih von Sportmaterialien.",
    email: "rac-asta-design@rheinahrcampus.de",
  },
  {
    title: "Nachhaltigkeit-Referat TODO!!!",
    holder: "Jonathan Vogel",
    photo: "/referate/nachhaltigkeit-referat.jpg",
    description:
      "Das Nachhaltigkeitsreferat engagiert sich für eine umweltbewusste Gestaltung des Hochschulalltags am RheinAhrCampus. Dazu gehören Informationsveranstaltungen, Workshops, nachhaltige Projekte und Aktionen, die nachhaltiges Denken und ressourcenschonendes Handeln fördern. Im Mittelpunkt stehen die Sensibilisierung für ökologische Themen, das bewusste Erleben von Natur und die konkrete Umsetzung nachhaltiger Ansätze - auf dem Campus und darüber hinaus. Wenn du Ideen oder Anregungen für die Weiterentwicklung nachhaltiger Strukturen oder für eine umweltbewusstere Gestaltung hast oder dich aktiv an der Umsetzung beteiligen möchtest, schreibe uns gerne eine E-Mail bei uns oder sprich uns persönlich an. Wir freuen uns auf den Austausch.",
    email: "rac-asta-nachhaltigkeit@rheinahrcampus.de",
  },
  // TODO: update Baracke Referat infos
  {
    title: "BaRACke-Referat",
    holder: "Niels Dieck, Jonas Romberg, Amelie ...",
    photo: "/referate/baracke-referat.jpg",
    description:
      "In der Remagener Innenstadt findet ihr unseren Studierendentreffpunkt ''Baracke''. Neben den regulären Öffnungszeiten, in denen man sich auf das ein oder andere Getränk treffen kann, finden dort regelmäßig Events statt. Das Referat Studierendentreffpunkt ist unter anderem für folgende Aufgaben in der BaRACke zuständig: Personal zu beschaffen, Personalplan erstellen, Getränke-Kalkulationen erstellen, Getränke bestellen, Öffentlichkeitsarbeit (Zusammenarbeit mit Presse, offizielle Gespräche mit Stadt, Hochschule, etc.), Sponsorenakquise und -betreuung, Renovierungsarbeiten und Eventorganisation. Aber auch Nicht-Referenten können sich sehr gerne in der Baracke als ehrenamtliches Thekenpersonal engagieren. Wenn ihr also Lust habt, in einem tollen Team zu arbeiten, meldet euch bei uns. Mehr Infos findet ihr hier.",
    email: "rac-asta-baracke@rheinahrcampus.de",
  },
];

const astaProtokolle = [
  {
    date: "2026-04-15",
    description: "AStA-Sitzung — Sommerfest-Planung",
    file: "/protokolle/asta-2026-04-15.pdf",
  },
  {
    date: "2026-04-01",
    description: "AStA-Sitzung — Haushaltsentwurf",
    file: "/protokolle/asta-2026-04-01.pdf",
  },
  // …rest
];

export default function Asta() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <h1 className="text-4xl font-bold">AStA</h1>

      <section id="info" className="scroll-mt-20">
        <h2 className="text-2xl font-bold mb-4">Info</h2>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <img
            src="/asta-team.jpg"
            alt="AStA-Team"
            className="rounded-lg w-full"
          />
          <p className="text-gray-700">
            Der Allgemeine Studierendenausschuss (AStA) ist ein Organ der
            verfassten Studierendenschaft. Der AStA wird durch das
            StudierendenParlament gewählt. Der Remagener AStA ist in
            verschiedene Referate aufgeteilt, die die Aufgabenbereiche des AStA
            abdecken und sich für die Studierenden engagieren. Unser Büro (Raum
            D 018) ist von Montag bis Freitag in der Mittagspause geöffnet. Es
            kann aber nicht schaden einfach mal vorbei zuschauen, falls ihr ein
            Problem oder eine Frage habt. Der AStA unterteilt sich an unserer
            Fachhochschule in Referate. Der AStA freut sich stets über Mithilfe
            der Studierenden. Vergesst bitte nie, dass auch wir nur Studierende
            sind und die Aufgaben im AStA neben unserem ganz normalen Studium
            übernehmen. Warum wir das machen? Ganz einfach: Es macht wirklich
            Spaß und im Endeffekt hat man sogar noch etwas davon… wenn man denn
            seine Aufgaben zufriedenstellend erfüllt. Falls Ihr Interesse habt
            unser grandioses Team zu bereichern, dann sprecht uns einfach an
            oder schreibt eine Email an rac-asta-vorsitz@rheinahrcampus.de
          </p>
        </div>
      </section>

      <section id="referate" className="scroll-mt-20">
        <h2 className="text-3xl font-bold mb-2">ASTA-Referate</h2>
        <p className="text-gray-600 mb-10">
          Hier stellen sich alle Referate des AStA-Remagen vor und erklären ihre
          jeweiligen Aufgaben:
        </p>

        <div className="space-y-12">
          {astaReferate.map((r) => (
            <article
              key={r.title}
              className="grid md:grid-cols-[1fr_200px] gap-8 items-start"
            >
              <div>
                <h3 className="text-xl font-bold mb-3">{r.title}:</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {r.description}
                </p>
                <p className="text-sm">
                  <span className="font-semibold underline">Email:</span>{" "}
                  <a href={`mailto:${r.email}`} className="hover:text-asta-red">
                    {r.email}
                  </a>
                </p>
              </div>
              <figure className="text-center">
                <img
                  src={r.photo}
                  alt={r.holder}
                  className="w-40 h-40 rounded-full object-cover mx-auto"
                />
                <figcaption className="italic mt-2 text-sm">
                  {r.title}: {r.holder}
                </figcaption>
              </figure>
            </article>
          ))}
        </div>
      </section>

      <section id="protokolle" className="scroll-mt-20">
        <h2 className="text-3xl font-bold mb-6">Protokolle</h2>

        <ul className="space-y-3">
          {astaProtokolle.map((p) => (
            <li key={p.file}>
              <a
                href={p.file}
                download
                className="flex items-center justify-between gap-4 p-4
                     border border-gray-200 rounded-lg
                     hover:border-asta-red hover:bg-asta-red hover:text-white
                     transition-colors"
              >
                <div>
                  <p className="font-semibold">
                    {new Date(p.date).toLocaleDateString("de-DE")}
                  </p>
                  <p className="text-sm opacity-80">{p.description}</p>
                </div>
                <span aria-hidden className="text-2xl">
                  ↓
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
