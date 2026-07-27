// client/src/pages/Impressum.tsx
//
// Imprint, required under § 5 DDG (the 2024 successor to § 5 TMG). Content
// mirrors the old asta-remagen.com Impressum, modernized.
//
// ⚠️ LEGAL TEXT — the AStA must confirm/update before launch:
//   - the current Vorsitz (vertretungsberechtigte Person), and
//   - whether a supervisory authority (Aufsichtsbehörde) must be named,
//     since the Studierendenschaft is a public-law body.

import ObfuscatedMailLink from "@/components/ObfuscatedMailLink";
import { ASTA_CONTACT } from "@/lib/contact";

// Current chair — update when the Vorsitz changes.
const VERTRETEN_DURCH = "Alpay Aydin";

export default function Impressum() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">Impressum</h1>

      <div>
        <h2 className="text-xl font-bold mb-1">Angaben gemäß § 5 DDG</h2>
        <p className="text-gray-700">
          Allgemeiner Studierendenausschuss am RheinAhrCampus
          <br />
          Joseph-Rovan-Allee 2
          <br />
          53424 Remagen
          <br />
          Raum D&nbsp;018
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">Vertreten durch</h2>
        <p className="text-gray-700">{VERTRETEN_DURCH}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">Kontakt</h2>
        <p className="text-gray-700">
          Telefon:{" "}
          <a href="tel:+4926429932185" className="hover:underline">
            02642&nbsp;932185
          </a>
          <br />
          E-Mail:{" "}
          <ObfuscatedMailLink
            user={ASTA_CONTACT.user}
            domain={ASTA_CONTACT.domain}
            className="text-asta-red hover:underline"
          />
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <p className="text-gray-700">{VERTRETEN_DURCH}, Anschrift wie oben.</p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">
          Verbraucherstreitbeilegung / Universalschlichtungsstelle
        </h2>
        <p className="text-gray-700">
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
          vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">Haftung für Inhalte</h2>
        <p className="text-gray-700">
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
          Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
          Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
          hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
          Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
          Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
          Inhalte umgehend entfernen.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">Haftung für Links</h2>
        <p className="text-gray-700">
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
          Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
          Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine
          permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne
          konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Links
          umgehend entfernen.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">Urheberrecht</h2>
        <p className="text-gray-700">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
          Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
          Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
          jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite
          sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
          wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden
          Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf
          eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
          entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
          werden wir derartige Inhalte umgehend entfernen.
        </p>
      </div>
    </section>
  );
}
