// client/src/pages/Profile.tsx
//
// User profile page. Gated: redirects to /login if not authenticated.
// Currently shows account info + a placeholder for future ticket purchases.

import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export default function Profile() {
  // Pull the current user from context. `loading` is true during the initial
  // /api/me check on app load; without it, we'd briefly redirect logged-in
  // users to /login on every page refresh (because user is null until /me
  // resolves).
  const { user, loading } = useAuth();

  // While the session check is pending, show a loading state. The Layout
  // wrapper provides the header/footer; we just fill the main area.
  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-gray-500">Lädt…</p>
      </section>
    );
  }

  // No user → bounce to login. `replace` means the current entry (/profile)
  // is replaced in browser history rather than pushed, so hitting back from
  // /login doesn't loop back to /profile.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Mein Profil</h1>

      {/* Account info — read-only for now. Editing is a later ticket. */}
      <dl className="grid grid-cols-[8rem_1fr] gap-y-3 text-sm">
        <dt className="font-semibold text-gray-700">Name</dt>
        <dd>{user.displayName}</dd>

        <dt className="font-semibold text-gray-700">Email</dt>
        <dd>{user.email}</dd>

        <dt className="font-semibold text-gray-700">Rolle</dt>
        <dd>
          {/* Show role with a small badge style so EDITOR is visually distinct. */}
          <span
            className={
              user.role === "EDITOR"
                ? "inline-block px-2 py-0.5 rounded bg-asta-red text-white text-xs font-semibold"
                : "inline-block px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-semibold"
            }
          >
            {user.role}
          </span>
        </dd>

        <dt className="font-semibold text-gray-700">Mitglied seit</dt>
        <dd>{new Date(user.createdAt).toLocaleDateString("de-DE")}</dd>
      </dl>

      {/* Placeholder for the future ticket system mentioned in the plan.
          Visible so AStA members see the intended structure even before
          tickets are implemented. */}
      <section className="mt-12 border-t pt-8">
        <h2 className="text-xl font-semibold mb-2">Meine Tickets</h2>
        <p className="text-gray-500">
          Hier erscheinen später deine gekauften Event-Tickets.
        </p>
      </section>
    </section>
  );
}
