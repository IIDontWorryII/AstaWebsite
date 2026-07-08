// client/src/pages/Barrierefreiheit.tsx
//
// Barrierefreiheits-Erklärung (accessibility statement).
//
// The AStA is NOT a public body (so no BITV 2.0 obligation) and runs no online
// shop / e-commerce service — so the BFSG doesn't apply either (and it would be
// exempt as a micro-organisation regardless). This is therefore a VOLUNTARY
// statement, NOT a statutory public-sector one — hence no BITV
// "Durchsetzungsverfahren / Schlichtungsstelle" section.
//
// ⚠️ Have the AStA confirm the wording + date before launch.

const STAND = "Juli 2026";

export default function Barrierefreiheit() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold">Barrierefreiheit</h1>

      <p className="mt-4 text-gray-700">
        Dem AStA der Hochschule Koblenz, RheinAhrCampus Remagen, ist ein
        möglichst barrierefreier Zugang zu dieser Website wichtig. Wir sind
        bemüht, unsere Inhalte für alle Menschen gut nutzbar zu gestalten, und
        verbessern die Zugänglichkeit fortlaufend.
      </p>
      <p className="mt-4 text-gray-700">
        Diese Erklärung ist freiwillig: Als studentische Vertretung sind wir
        keine öffentliche Stelle und betreiben keinen Online-Shop; eine
        gesetzliche Verpflichtung zur Barrierefreiheit (BITV&nbsp;2.0 bzw.
        BFSG) besteht daher nicht. Barrierefreiheit ist uns dennoch ein
        Anliegen.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-2">Aktueller Stand</h2>
      <p className="text-gray-700">
        Wir orientieren uns an den Erfolgskriterien der WCAG&nbsp;2.1
        (Stufe&nbsp;AA). Die Website ist weitgehend zugänglich – unter anderem
        mit der Tastatur bedienbar, mit ausreichenden Kontrasten und mit einer
        sinnvollen Struktur für Bildschirmleseprogramme. Von Redakteurinnen und
        Redakteuren hochgeladene Inhalte (z.&nbsp;B. PDF-Protokolle oder
        Veranstaltungsplakate) können im Einzelfall nicht vollständig
        barrierefrei sein.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-2">
        Erstellung dieser Erklärung
      </h2>
      <p className="text-gray-700">
        Diese Erklärung wurde im {STAND} erstellt. Grundlage ist eine
        Selbstbewertung, unter anderem mit automatisierten Prüfwerkzeugen
        (z.&nbsp;B. Google&nbsp;Lighthouse) sowie manuellen Tests der
        Tastaturbedienung und der Bildschirmleser-Kompatibilität.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-2">
        Barrieren melden – Feedback und Kontakt
      </h2>
      <p className="text-gray-700">
        Sind Ihnen Mängel beim barrierefreien Zugang aufgefallen oder benötigen
        Sie Inhalte in einer zugänglichen Form? Wir helfen gern weiter:
      </p>
      <p className="text-gray-700 mt-2">
        AStA Remagen
        <br />
        E-Mail:{" "}
        <a
          href="mailto:rac-asta-vorsitz@rheinahrcampus.de"
          className="text-asta-red hover:underline"
        >
          rac-asta-vorsitz@rheinahrcampus.de
        </a>
      </p>
    </section>
  );
}
