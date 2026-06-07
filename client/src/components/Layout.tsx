// client/src/components/Layout.tsx
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToHash from "./ScrollToHash";

export default function Layout() {
  return (
    <div>
      <ScrollToHash />
      {/* Skip link: hidden until focused, lets keyboard users jump straight
          to the main content past the nav. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-2 focus:left-2 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:font-medium focus:text-asta-red focus:shadow"
      >
        Zum Inhalt springen
      </a>
      <Header />
      {/* tabIndex=-1 lets the skip link move focus here without making it a
          tab stop in normal navigation. */}
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
