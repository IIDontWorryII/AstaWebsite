// client/src/pages/Kontakt.tsx
//
// Contact page: how to reach the AStA. Static info (no form — there's no
// mail backend yet); links use mailto:/tel: so they work from any device.

import { SOCIAL_LINKS } from "@/lib/socials";
import ObfuscatedMailLink from "@/components/ObfuscatedMailLink";
import { ASTA_CONTACT } from "@/lib/contact";

export default function Kontakt() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold">Kontakt</h1>
      <p className="mt-4 text-gray-600">
        Du hast eine Frage, eine Idee oder möchtest dich engagieren? Melde dich
        bei uns – wir freuen uns auf dich.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold mb-2">AStA Remagen</h2>
          <p className="text-gray-700">Allgemeiner Studierendenausschuss</p>
          <p className="text-gray-700">der Hochschule Koblenz</p>
          <address className="not-italic text-gray-700 mt-2">
            Joseph-Rovan-Allee 2
            <br />
            53424 Remagen
            <br />
            Büro: Raum D&nbsp;018
          </address>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-2">Direkt erreichen</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              ✉️{" "}
              <ObfuscatedMailLink
                user={ASTA_CONTACT.user}
                domain={ASTA_CONTACT.domain}
                className="text-asta-red hover:underline"
              />
            </li>
            <li>
              📞{" "}
              <a href="tel:+4926429932185" className="hover:underline">
                02642&nbsp;932185
              </a>
            </li>
          </ul>

          <h2 className="text-lg font-bold mt-6 mb-2">Folge uns</h2>
          <div className="flex gap-4">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-asta-red hover:underline"
            >
              Instagram
            </a>
            <a
              href={SOCIAL_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-asta-red hover:underline"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
