// client/src/components/Footer.tsx

import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "@/lib/socials";

export default function Footer() {
  return (
    <footer className="relative bg-asta-red text-white overflow-hidden">
      {/* Decorative watermark — behind content. aria-hidden because it's purely visual */}
      <img
        src="/asta-logo-footer.png"
        alt=""
        aria-hidden="true"
        className="absolute right-0 bottom-0 h-full w-auto opacity-50 pointer-events-none"
      />

      {/* Content sits on top of the watermark via z-10 */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 py-8
                      grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Col 1: org info + contact */}
        <div>
          <h3 className="text-lg font-bold">AStA Remagen</h3>
          <p className="text-sm mt-1 opacity-90">
            Allgemeiner Studierendenausschuss
          </p>
          <p className="text-sm opacity-90">der Hochschule Koblenz</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="mailto:rac-asta-vorsitz@rheinahrcampus.de"
                className="hover:underline"
              >
                📧 rac-asta-vorsitz@rheinahrcampus.de
              </a>
            </li>
            <li>
              <address>📍 Joseph-Rovan-Allee 2, 53424 Remagen</address>
            </li>
            <li>
              <a href="tel:+4926429 32185" className="hover:underline">
                📞 02642-932185
              </a>
            </li>
          </ul>
        </div>

        {/* Col 2: quick links */}
        <div>
          <h3 className="text-lg font-bold mb-4">Schnelllinks</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/gremien/asta" className="hover:underline">
                Über uns
              </Link>
            </li>
            <li>
              <Link to="/gremien/asta#referate" className="hover:underline">
                Referate
              </Link>
            </li>
            <li>
              <Link to="/eventkalender" className="hover:underline">
                Eventkalender
              </Link>
            </li>
            {/* Kontakt moved here from the header (AW-46). */}
            <li>
              <Link to="/kontakt" className="hover:underline">
                Kontakt
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: socials */}
        <div>
          <h3 className="text-lg font-bold mb-4">Folge uns</h3>
          <div className="flex gap-4">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="bg-white rounded-full p-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/Instagram_logo_2016.svg"
                alt=""
                aria-hidden="true"
                className="h-6 w-6"
              />
            </a>
            <a
              href={SOCIAL_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="bg-white rounded-full p-2 hover:opacity-80 transition-opacity"
            >
              <img
                src="/tiktok-icon-2.svg"
                alt=""
                aria-hidden="true"
                className="h-6 w-6"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Legal bar — required links, present on every page. Impressum &
          Datenschutz are added in AW-56 / AW-57. */}
      <div className="relative z-10 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/barrierefreiheit" className="hover:underline">
            Barrierefreiheit
          </Link>
        </div>
      </div>
    </footer>
  );
}
