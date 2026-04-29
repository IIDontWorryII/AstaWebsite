// client/src/components/Header.tsx

export default function Header() {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/*Left: logo */}
        <a href="#">
          <img
            src="/asta-logo.png"
            alt="AStA Remagen"
            className="h-16 w-auto"
          />
        </a>

        {/*Center:  primary nav */}
        <nav className="hidden md:flex gap-8">
          <a
            href="#"
            className="font-medium text-asta-red border-b-2 border-asta-red pb-1"
          >
            Home
          </a>
          <a href="#" className="font-medium hover:text-asta-red">
            Gremien
          </a>
          <a href="#" className="font-medium hover:text-asta-red">
            Eventkalender
          </a>
          <a href="#" className="font-medium hover:text-asta-red">
            BaRACke
          </a>
          <a href="#" className="font-medium hover:text-asta-red">
            Sport
          </a>
          <a href="#" className="font-medium hover:text-asta-red">
            Kontakt
          </a>
        </nav>

        {/* Right: CTA + icons */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:text-asta-red"
            aria-label="Instagram"
          >
            📷
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl hover:text-asta-red"
            aria-label="TikTok"
          >
            🎵
          </a>
        </div>
      </div>
    </header>
  );
}
