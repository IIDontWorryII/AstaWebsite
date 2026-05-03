// client/src/components/Header.tsx

import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/*Left: logo */}
        <Link to="/">
          <img
            src="/asta-logo.png"
            alt="AStA Remagen"
            className="h-16 w-auto"
          />
        </Link>

        {/*Center:  primary nav */}
        <nav className="hidden md:flex gap-8">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `font-medium pb-1 ${isActive ? "text-asta-red border-b-2 border-asta-red" : "hover:text-asta-red"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/gremien"
            className={({ isActive }) =>
              `font-medium pb-1 ${isActive ? "text-asta-red border-b-2 border-asta-red" : "hover:text-asta-red"}`
            }
          >
            Gremien
          </NavLink>
          <NavLink
            to="/eventkalender"
            className={({ isActive }) =>
              `font-medium pb-1 ${isActive ? "text-asta-red border-b-2 border-asta-red" : "hover:text-asta-red"}`
            }
          >
            Eventkalender
          </NavLink>
          <NavLink
            to="/baracke"
            className={({ isActive }) =>
              `font-medium pb-1 ${isActive ? "text-asta-red border-b-2 border-asta-red" : "hover:text-asta-red"}`
            }
          >
            BaRACke
          </NavLink>
          <NavLink
            to="/sport"
            className={({ isActive }) =>
              `font-medium pb-1 ${isActive ? "text-asta-red border-b-2 border-asta-red" : "hover:text-asta-red"}`
            }
          >
            Sport
          </NavLink>
          <NavLink
            to="/kontakt"
            className={({ isActive }) =>
              `font-medium pb-1 ${isActive ? "text-asta-red border-b-2 border-asta-red" : "hover:text-asta-red"}`
            }
          >
            Kontakt
          </NavLink>
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
