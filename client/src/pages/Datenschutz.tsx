// client/src/pages/Datenschutz.tsx
//
// Privacy policy (DSGVO/GDPR Art. 13). Built from the actual data the app
// processes; the binding text must be reviewed and completed by the AStA +
// the Hochschule's Datenschutzbeauftragte/r before launch.
//
// ⚠️ Placeholders in [eckigen Klammern] must be filled:
//   - the Datenschutzbeauftragte/r (Hochschule) contact, and
//   - confirmation of whether any processor stores data outside the EU
//     (Render/Cloudflare/Neon regions) and the transfer mechanism if so.

const STAND = "Juni 2026";

export default function Datenschutz() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>
      <p className="text-gray-700">
        Wir nehmen den Schutz deiner personenbezogenen Daten ernst. Nachfolgend
        informieren wir dich darüber, welche Daten beim Besuch und bei der
        Nutzung dieser Website verarbeitet werden und welche Rechte dir
        zustehen. Stand: {STAND}.
      </p>

      <div>
        <h2 className="text-xl font-bold mb-1">1. Verantwortlicher</h2>
        <p className="text-gray-700">
          Allgemeiner Studierendenausschuss am RheinAhrCampus
          <br />
          Joseph-Rovan-Allee 2, 53424 Remagen
          <br />
          E-Mail:{" "}
          <a
            href="mailto:rac-asta-vorsitz@rheinahrcampus.de"
            className="text-asta-red hover:underline"
          >
            rac-asta-vorsitz@rheinahrcampus.de
          </a>
          <br />
          Weitere Angaben siehe{" "}
          <a href="/impressum" className="text-asta-red hover:underline">
            Impressum
          </a>
          .
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">2. Datenschutzbeauftragte/r</h2>
        <p className="text-gray-700">
          <span className="text-gray-500">
            [Name und Kontaktdaten der/des Datenschutzbeauftragten der
            Hochschule Koblenz ergänzen.]
          </span>
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">
          3. Aufruf der Website (Server-Logs)
        </h2>
        <p className="text-gray-700">
          Beim Aufruf der Website werden durch den Hosting-Anbieter automatisch
          technische Daten verarbeitet (z. B. IP-Adresse, Datum und Uhrzeit des
          Zugriffs, aufgerufene Seite, Browsertyp), soweit dies für den sicheren
          und stabilen Betrieb erforderlich ist. Rechtsgrundlage ist unser
          berechtigtes Interesse am sicheren Betrieb der Website (Art. 6 Abs. 1
          lit. f DSGVO).
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">4. Cookies</h2>
        <p className="text-gray-700">
          Diese Website verwendet ausschließlich ein technisch notwendiges
          Cookie für die Anmeldung („auth_token“). Es speichert deine
          Sitzung, damit du angemeldet bleibst, und wird nicht für Tracking
          oder Werbung genutzt. Da es technisch erforderlich ist, ist hierfür
          keine Einwilligung nötig (§ 25 Abs. 2 TDDDG; Art. 6 Abs. 1 lit. f
          DSGVO). Tracking-, Analyse- oder Marketing-Cookies werden nicht
          gesetzt.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">
          5. Benutzerkonto und Merkliste
        </h2>
        <p className="text-gray-700">
          Wenn du ein Konto anlegst, verarbeiten wir deine E-Mail-Adresse,
          deinen Anzeigenamen, dein Passwort (ausschließlich verschlüsselt
          gespeichert) sowie – falls du es hochlädst – dein Profilbild.
          Außerdem speichern wir, welche Veranstaltungen du auf deine Merkliste
          gesetzt hast. Rechtsgrundlage ist die Erfüllung des
          Nutzungsverhältnisses bzw. deine Einwilligung (Art. 6 Abs. 1 lit. b
          und lit. a DSGVO). Du kannst dein Konto jederzeit löschen lassen.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">
          6. Von Redaktion hochgeladene Inhalte
        </h2>
        <p className="text-gray-700">
          Berechtigte Redakteurinnen und Redakteure des AStA können Inhalte
          (z. B. Veranstaltungsplakate, Fotos, Protokolle) hochladen. Sofern
          dabei personenbezogene Daten Dritter sichtbar werden, erfolgt dies im
          Rahmen der Aufgaben des AStA bzw. auf Grundlage einer Einwilligung.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">
          7. Empfänger / Auftragsverarbeiter
        </h2>
        <p className="text-gray-700">
          Zum Betrieb der Website setzen wir Dienstleister ein, die Daten in
          unserem Auftrag verarbeiten (Auftragsverarbeitung, Art. 28 DSGVO):
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
          <li>Hosting der Website und Schnittstelle: Render</li>
          <li>Speicherung hochgeladener Dateien: Cloudflare R2</li>
          <li>Datenbank (Konten, Veranstaltungen usw.): Neon (PostgreSQL)</li>
        </ul>
        <p className="text-gray-700 mt-2">
          <span className="text-gray-500">
            [Bitte prüfen, ob bei diesen Anbietern eine Verarbeitung außerhalb
            der EU stattfindet; falls ja, hier die Grundlage der Übermittlung
            (z. B. EU-Standardvertragsklauseln) angeben.]
          </span>
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">8. Speicherdauer</h2>
        <p className="text-gray-700">
          Wir speichern personenbezogene Daten nur so lange, wie es für die
          genannten Zwecke erforderlich ist oder gesetzliche
          Aufbewahrungsfristen es verlangen. Kontodaten werden bei Löschung des
          Kontos entfernt.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-1">9. Deine Rechte</h2>
        <p className="text-gray-700">
          Dir stehen die Rechte auf Auskunft (Art. 15), Berichtigung (Art. 16),
          Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
          Datenübertragbarkeit (Art. 20) sowie auf Widerspruch (Art. 21) zu.
          Erteilte Einwilligungen kannst du jederzeit mit Wirkung für die
          Zukunft widerrufen. Außerdem hast du das Recht, dich bei einer
          Datenschutz-Aufsichtsbehörde zu beschweren – zuständig ist die/der
          Landesbeauftragte für den Datenschutz und die Informationsfreiheit
          Rheinland-Pfalz.
        </p>
      </div>
    </section>
  );
}
