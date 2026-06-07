// client/src/pages/Barrierefreiheit.tsx
//
// Erklärung zur Barrierefreiheit (accessibility statement), required for
// public-sector websites under BITV 2.0 / EU 2016/2102.
//
// ⚠️ LEGAL TEXT — before launch, the AStA/Hochschule must confirm:
//   - the conformance status (weitgehend / teilweise / vollständig),
//   - the assessment date,
//   - the feedback contact, and
//   - the correct enforcement body (Schlichtungsstelle) for RLP.
// Best source: mirror the Hochschule Koblenz's own Erklärung zur
// Barrierefreiheit. The placeholders in [eckigen Klammern] must be filled.

// Last reviewed/created date shown in the statement. Update on each review.
const STAND = "7. Juni 2026";

export default function Barrierefreiheit() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold">Erklärung zur Barrierefreiheit</h1>

      <p className="mt-4 text-gray-700">
        Der AStA der Hochschule Koblenz, RheinAhrCampus Remagen, ist bemüht,
        seine Website im Einklang mit der Barrierefreie-Informationstechnik-
        Verordnung (BITV 2.0) zur Umsetzung der Richtlinie (EU) 2016/2102
        barrierefrei zugänglich zu machen. Diese Erklärung gilt für die Website
        des AStA Remagen.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-2">
        Stand der Vereinbarkeit mit den Anforderungen
      </h2>
      <p className="text-gray-700">
        Diese Website ist mit den Erfolgskriterien der WCAG 2.1 (Stufe AA) bzw.
        der BITV 2.0 <strong>weitgehend vereinbar</strong>.{" "}
        <span className="text-gray-500">
          [Konformitätsstatus von AStA/Hochschule abschließend bestätigen:
          vollständig / weitgehend / teilweise vereinbar.]
        </span>
      </p>

      <h2 className="text-xl font-bold mt-8 mb-2">
        Nicht barrierefreie Inhalte
      </h2>
      <p className="text-gray-700">
        Nach derzeitigem Stand sind keine wesentlichen Barrieren bekannt. Von
        Redakteurinnen und Redakteuren hochgeladene Inhalte – etwa
        PDF-Protokolle oder Veranstaltungsplakate – können im Einzelfall nicht
        vollständig barrierefrei sein.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-2">
        Erstellung dieser Erklärung
      </h2>
      <p className="text-gray-700">
        Diese Erklärung wurde am {STAND} erstellt. Grundlage ist eine
        Selbstbewertung, unter anderem mit automatisierten Prüfwerkzeugen
        (z. B. Google Lighthouse) sowie manuellen Tests der Tastaturbedienung
        und der Bildschirmleser-Kompatibilität.
      </p>

      <h2 className="text-xl font-bold mt-8 mb-2">
        Barrieren melden – Feedback und Kontakt
      </h2>
      <p className="text-gray-700">
        Sind Ihnen Mängel beim barrierefreien Zugang aufgefallen oder benötigen
        Sie Inhalte in einer zugänglichen Form? Melden Sie sich bei uns:
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

      <h2 className="text-xl font-bold mt-8 mb-2">Durchsetzungsverfahren</h2>
      <p className="text-gray-700">
        Sollten wir Ihre Rückmeldung nicht zufriedenstellend bearbeiten, können
        Sie sich an die zuständige Schlichtungsstelle wenden.{" "}
        <span className="text-gray-500">
          [Zuständige Schlichtungsstelle für Rheinland-Pfalz mit Kontaktdaten
          von AStA/Hochschule ergänzen – siehe Erklärung der Hochschule
          Koblenz.]
        </span>
      </p>
    </section>
  );
}
