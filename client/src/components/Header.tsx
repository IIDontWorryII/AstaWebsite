// client/src/components/Header.tsx

import { Link, NavLink } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-medium pb-1 ${isActive ? "text-asta-red border-b-2 border-asta-red" : "hover:text-asta-red"}`;

const navItems = [
  { to: "/eventkalender", label: "Eventkalender" },
  { to: "/baracke", label: "BaRACke" },
  { to: "/sport", label: "Sport" },
  { to: "/kontakt", label: "Kontakt" },
];

const gremienSections = [
  {
    title: "ASTA",
    href: "/gremien/asta",
    items: [
      { title: "Info", href: "/gremien/asta#info" },
      { title: "Referate", href: "/gremien/asta#referate" },
      { title: "Protokolle", href: "/gremien/asta#protokolle" },
    ],
  },
  {
    title: "STUPA",
    href: "/gremien/stupa",
    items: [
      { title: "Info", href: "/gremien/stupa#info" },
      { title: "Mitglieder", href: "/gremien/stupa#mitglieder" },
      { title: "Protokolle", href: "/gremien/stupa#protokolle" },
    ],
  },
  {
    title: "FACHSCHAFTEN",
    href: "/gremien/fachschaften",
    items: [
      { title: "Info", href: "/gremien/fachschaften#info" },
      { title: "MIT", href: "/gremien/fachschaften#mit" },
      { title: "WISO", href: "/gremien/fachschaften#wiso" },
    ],
  },
];

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
          {/* Home NavLink */}
          <NavLink key="/" to="/" end className={navLinkClass}>
            Home
          </NavLink>
          {/* Gremien Mega Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className="bg-transparent hover:bg-transparent
                             data-open:bg-transparent data-popup-open:bg-transparent
                             p-0 h-auto rounded-none
                             font-medium text-base pb-1
                             hover:text-asta-red data-popup-open:text-asta-red"
                >
                  Gremien
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-3 gap-6 p-6 w-[600px]">
                    {gremienSections.map((section) => (
                      <div key={section.title}>
                        {/* Section heading */}
                        <Link
                          to={section.href}
                          className="block font-bold text-asta-red mb-3"
                        >
                          {section.title}
                        </Link>
                        {/* Section items */}
                        <ul className="space-y-1">
                          {section.items.map((item) => (
                            <li key={item.href}>
                              <NavigationMenuLink
                                render={<Link to={item.href} />}
                                className="text-sm hover:text-asta-red"
                              >
                                {item.title}
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
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
