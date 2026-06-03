// client/src/components/Footer.tsx

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
              <a href="#" className="hover:underline">
                Über uns
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Referate
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: socials */}
        <div>
          <h3 className="text-lg font-bold mb-4">Folge uns</h3>
          <div className="flex gap-4">
            <a
              href="#"
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
              href="#"
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
    </footer>
  );
}
