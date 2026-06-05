import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Manages scroll position on route and hash changes.
 *
 *   - Hash present (e.g. /gremien/asta#info) → smooth-scroll to the element
 *     with the matching id. Deferred via requestAnimationFrame so layout has
 *     settled (images, fonts) before we measure scroll target.
 *
 *   - No hash → scroll to top of page. Fixes the "scroll position lingers
 *     after SPA navigation" issue when going from #info to no-hash on the
 *     same path, or when navigating between pages.
 *
 * React Router does not handle either of these by default for the declarative
 * <Routes>/<Route> API. Place once inside Layout.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // The target may not exist yet: Gremien pages fetch their content
      // async, so when arriving from ANOTHER page (e.g. Home → /gremien/asta
      // #referate) the section mounts a beat later. Poll briefly until it
      // appears, then scroll. (Same-page hash clicks hit on the first try.)
      let attempts = 0;
      let timer: ReturnType<typeof setTimeout>;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        // ~2s budget (20 × 100ms) covers a slow content fetch, then gives up.
        if (++attempts < 20) {
          timer = setTimeout(tryScroll, 100);
        }
      };
      tryScroll();
      return () => clearTimeout(timer);
    }

    // No hash — fresh navigation, start at top of page.
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
