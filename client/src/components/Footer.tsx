// client/src/components/Footer.tsx

import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { ABOUT_VIDEO_URL, SOCIAL_LINKS } from "@/lib/socials";
import { useAuth } from "@/auth/AuthContext";

export default function Footer() {
  const { user, loading } = useAuth();

  return (
    <footer className="relative bg-asta-red text-white overflow-hidden">
      {/* Decorative watermark — behind content. aria-hidden because it's purely visual */}
      <img
        src="/asta-logo-footer.png"
        alt=""
        aria-hidden="true"
        className="absolute right-0 bottom-0 h-full w-auto opacity-50 pointer-events-none"
      />

      {/* Content sits on top of the watermark via z-10.
          Uneven columns: the Gremien-video column gets extra width (and the
          quick-links column a little less) so the video fills the space
          between Schnelllinks and "Mein Bereich" instead of leaving a gap. */}
      <div
        className="relative z-10 max-w-7xl mx-auto px-6 py-8
                      grid grid-cols-1 gap-8
                      md:grid-cols-[1fr_0.6fr_1.8fr_0.9fr]"
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

        {/* Col 3: "Über uns" video — a thumbnail linking out to YouTube in a
            new tab. No iframe embed, so no YouTube cookies / cookie banner. */}
        <div>
          <h3 className="text-lg font-bold mb-4">
            Was sind eigentlich die studentische Gremien?
          </h3>
          <a
            href={ABOUT_VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative w-full max-w-sm rounded-lg overflow-hidden shadow-lg"
            aria-label="Video zu den studentischen Gremien auf YouTube ansehen"
          >
            <img
              src="/ueber-uns-video.webp"
              alt="Vorschaubild des Videos über die studentischen Gremien"
              loading="lazy"
              decoding="async"
              className="w-full aspect-video object-cover"
            />
            {/* Play badge centered over the thumbnail. */}
            <span className="absolute inset-0 grid place-items-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <span className="grid place-items-center h-12 w-12 rounded-full bg-asta-red/90 text-white shadow-lg">
                <Play className="h-6 w-6 translate-x-0.5 fill-current" />
              </span>
            </span>
          </a>
        </div>

        {/* Col 4: account (moved here from the header) + socials */}
        <div>
          {/* Login/Registrierung or profile link. Hidden while the session
              check is in flight to avoid a flash of the wrong state. */}
          {!loading && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">Mein Bereich</h3>
              {user ? (
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/profile" className="hover:underline">
                      Mein Profil
                    </Link>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/login" className="hover:underline">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="hover:underline">
                      Registrieren
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          )}

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
          <Link to="/impressum" className="hover:underline">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:underline">
            Datenschutz
          </Link>
          <Link to="/barrierefreiheit" className="hover:underline">
            Barrierefreiheit
          </Link>
        </div>
      </div>
    </footer>
  );
}
