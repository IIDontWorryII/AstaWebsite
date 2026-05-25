// client/src/components/Header.tsx

import { Link, NavLink, useNavigate } from "react-router-dom";
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

        {/* Right: auth widget + social icons */}
        <div className="flex items-center gap-4">
          <AuthWidget />

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

/**
 * Right-hand auth controls. Reads the current user from AuthContext and
 * shows one of three states:
 *   - loading: nothing (avoids a "Login" flash for users who actually have
 *              a valid session — the /api/me check is in flight)
 *   - logged out: Login link + Registrieren button
 *   - logged in:  Profil link (with display name) + Logout button
 *
 * Kept as a sibling component (not inlined) so its state logic doesn't
 * clutter the layout JSX above.
 */
function AuthWidget() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // During the initial session check, render nothing. The widget is small
  // and slots in beside other controls — empty is less disruptive than a
  // brief "Login / Registrieren" flash that then swaps to the user menu.
  if (loading) {
    return null;
  }

  // Logged out: a low-emphasis text link for Login and a primary Button
  // for Registrieren. The visual hierarchy nudges new users toward signup
  // while letting returning users find Login easily.
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="text-sm font-medium hover:text-asta-red"
        >
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

  // Logged in: name links to profile, button logs out and returns home.
  //
  // IMPORTANT: navigate("/") happens *before* awaiting logout(). Reason:
  // when logout() resolves, AuthContext sets user=null. If we're still on
  // /profile at that moment, Profile's guard (`if (!user) <Navigate
  // to="/login"/>`) fires and the imperative navigate("/") below loses
  // the race. By navigating first, /profile unmounts before its guard
  // can re-render, and the user lands on Home as intended.
  async function handleLogout() {
    navigate("/", { replace: true });
    try {
      await logout();
    } catch (err) {
      // Logout failures are rare (the server endpoint is essentially
      // a "always succeeds" no-op). Log for debugging; the user's local
      // state is already cleared by AuthContext.logout() on success.
      console.error("Logout failed:", err);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/profile"
        className="text-sm font-medium hover:text-asta-red"
        title="Mein Profil"
      >
        {user.displayName}
      </Link>
      {/* Tailwind v4 removed the default `cursor: pointer` on <button>,
          so we add it explicitly to match users' click-affordance expectations. */}
      <Button
        onClick={handleLogout}
        size="sm"
        variant="ghost"
        className="cursor-pointer"
      >
        Logout
      </Button>
    </div>
  );
}
