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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { SOCIAL_LINKS } from "@/lib/socials";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-medium pb-1 ${isActive ? "text-asta-red border-b-2 border-asta-red" : "hover:text-asta-red"}`;

// Kontakt now lives in the footer (AW-46), so it's no longer in the nav.
const navItems = [
  { to: "/eventkalender", label: "Eventkalender" },
  { to: "/baracke", label: "BaRACke" },
  { to: "/sport", label: "Sport" },
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
  // EDITORs get an "Admin" entry in the central nav (right of Sport).
  const { user } = useAuth();

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/*Left: logo */}
        <Link to="/">
          <img src="/asta-logo.png" alt="AStA Remagen" className="h-16 w-auto" />
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
          {/* Admin sits at the end of the nav, EDITOR-only. */}
          {user?.role === "EDITOR" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right: social icons, then the auth widget (profile / login). */}
        <div className="flex items-center gap-4">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70 transition-opacity"
            aria-label="Instagram"
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
            className="hover:opacity-70 transition-opacity"
            aria-label="TikTok"
          >
            <img
              src="/tiktok-icon-2.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6"
            />
          </a>

          <AuthWidget />
        </div>
      </div>
    </header>
  );
}

/**
 * Right-hand auth controls. Reads the current user from AuthContext and
 * shows one of three states:
 *   - loading: nothing (avoids a "Login" flash for users who actually have
 *              a valid session — the /api/me check is in flight)
 *   - logged out: Login link + Registrieren button
 *   - logged in:  an avatar circle linking to the profile (Logout now lives
 *                 on the profile page itself — AW-46)
 */
function AuthWidget() {
  const { user, loading } = useAuth();

  // During the initial session check, render nothing (avoids a Login flash).
  if (loading) {
    return null;
  }

  // Logged out: Login link + Registrieren button.
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm font-medium hover:text-asta-red">
          Login
        </Link>
        {/* Base UI's Button uses `render={<Link/>}` (not `asChild` like Radix)
            to delegate rendering to a Link without losing button styles.
            `nativeButton={false}` tells Base UI we're rendering an <a>, not
            a <button> — without it, Base UI logs an accessibility warning. */}
        <Button
          render={<Link to="/signup" />}
          nativeButton={false}
          size="sm"
          variant="brandOutline"
        >
          Registrieren
        </Button>
      </div>
    );
  }

  // Logged in: a profile icon (a touch larger than the social icons so it
  // reads as a distinct control) linking to the profile page.
  return (
    <Link
      to="/profile"
      aria-label="Mein Profil"
      title="Mein Profil"
      className="hover:opacity-80 transition-opacity"
    >
      <img
        src="/profile-icon.png"
        alt="Mein Profil"
        className="h-10 w-10"
      />
    </Link>
  );
}
