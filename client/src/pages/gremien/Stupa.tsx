// src/pages/gremien/Stupa.tsx

import GremiumProtocols from "./GremiumProtocols";

export default function Stupa() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <h1 className="text-4xl font-bold">StuPa</h1>

      <section id="info" className="scroll-mt-20">
        <h2 className="text-2xl font-bold mb-4">Info</h2>
        <p className="text-gray-700">
          Wer wir sind? Das Studierendenparlament (StuPa) ist das oberste
          Aufsichts- und Beschlussgremium der studentischen Selbstverwaltung am
          RheinAhrCampus. Es entscheidet laut Hochschulgesetz in grundsätzlichen
          Angelegenheiten der Studierendenschaft. Das StuPa des RheinAhrCampus
          versteht sich somit als Organ aller Studierenden und fasst Beschlüsse
          in deren Interesse. Das StuPa setzt sich aus 11 Studierenden zusammen,
          die einmal pro Jahr von der Studierendenschaft als ihre Vertreter
          ausgewählt werden und wird nach außen vertreten von seinem Präsidenten
          und dessen Stellvertreter. Was wir tun? Das StuPa wählt die Vertreter
          des Allgemeinen Studierendenausschusses (AStA), welcher das
          ausführende Organ der studentischen Selbstverwaltung ist. Zudem
          beschließt das StuPa die Verwendung studentischer Finanzmittel im
          jährlichen Haushalt und trifft Entscheidungen über Finanzanträge und
          größere Einzelausgaben. Das Studierendenparlament entscheidet über die
          Einrichtung und Änderung von Fachschaften sowie die Beschließung oder
          Änderung von Satzungen der Studierendenschaft. Es ruft
          Vollversammlungen ein, wenn Entscheidungen getroffen werden müssen,
          die weitreichende Auswirkungen auf alle Studierenden haben. Es ist
          Ansprechpartner für alle Probleme, welche die Studierendenschaft
          betreffen. Wie wir zu erreichen sind? Zu erreichen ist das StuPa per
          E-Mail (racstupa(at)hs-koblenz.de), sowie über den AStA. Das StuPa
          tagt regelmäßig während der Vorlesungszeit. Die Sitzungen sind
          öffentlich und jeder Studierende ist herzlich eingeladen, auf Probleme
          hinzuweisen und sich an den Entscheidungen zu beteiligen. Was ihr tun
          könnt? Jeder Studierende, der Interesse hat selbst etwas zu bewegen,
          kann sich, unabhängig von Studiengang und Semester, in das StuPa
          wählen lassen. Ebenso ist jeder Studierende berechtigt, in eigenem
          Namen oder im Namen von Interessengruppen Anträge zu stellen. Es ist
          euer Studium und euer Campus, also nutzt die Chance etwas zu tun, um
          die Dinge zu verändern, die ihr anders haben wollt.
        </p>
      </section>

      <section id="referate" className="scroll-mt-20">
        <h2 className="text-2xl font-bold mb-4">Mitglieder</h2>
        <img
          src="/stupa-team.jpg"
          alt="stupa-Team"
          className="rounded-lg w-full"
        />
        <p className="text-gray-700">
          Patrick Maas (Präsident) Simon Knudsen, Leon Schneider, Jens Hidien,
          Lars Bockheiser, Manuel Lenz, Annika Schlag, Lou Stahl, Chiara Vogt,
          Bastian Langenbach.
        </p>
      </section>

      <GremiumProtocols gremium="STUPA" />
    </div>
  );
}
