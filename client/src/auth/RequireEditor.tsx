// client/src/auth/RequireEditor.tsx
//
// Route guard for admin pages. Wraps any element tree and only renders it
// if the current user has role === "EDITOR". Otherwise:
//   - while loading the initial /api/me check: shows a spinner placeholder
//   - not logged in:           redirects to /login
//   - logged in as USER:       redirects to / (home)
//
// Usage in App.tsx:
//   <Route
//     path="/admin/events"
//     element={
//       <RequireEditor>
//         <AdminEvents />
//       </RequireEditor>
//     }
//   />
//
// We previously inlined a similar check in Profile.tsx. As admin pages
// proliferate, having a single wrapper means the gating rules are defined
// once and every admin page automatically gets the same behavior.

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface RequireEditorProps {
  children: ReactNode;
}

export default function RequireEditor({ children }: RequireEditorProps) {
  const { user, loading } = useAuth();

  // While the initial /api/me check is in flight, don't flash a redirect —
  // we don't yet know if the user is an EDITOR who refreshed the page.
  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-gray-500">Lädt…</p>
      </section>
    );
  }

  // Not logged in at all → bounce to login. `replace` so the back button
  // doesn't loop back here after the user logs in.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → bounce to home. We could show a "forbidden"
  // page instead, but for a small site silently redirecting away from
  // routes the user can't see is simpler and matches their expectation
  // (the admin link wouldn't have been shown to them anyway).
  if (user.role !== "EDITOR") {
    return <Navigate to="/" replace />;
  }

  // All checks passed — render the protected page.
  return <>{children}</>;
}
