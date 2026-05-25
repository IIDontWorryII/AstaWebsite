// client/src/pages/Signup.tsx
//
// Signup form. Same shape as Login but with an extra displayName field.
// On success, the server creates a USER-role account, sets the auth cookie,
// and we redirect to /profile.

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Three controlled inputs this time.
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // The server enforces password >= 8 chars and email format. If the
      // request is rejected (400 too short, 409 email taken), the thrown
      // Error.message will be the server's `error` field.
      await signup({ displayName, email, password });
      navigate("/profile");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registrierung fehlgeschlagen",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Registrieren</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-semibold mb-1"
          >
            Anzeigename
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            autoComplete="email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold mb-1"
          >
            Passwort
          </label>
          <input
            id="password"
            type="password"
            required
            // minLength is HTML5 validation. The server still re-checks
            // server-side (defense in depth — never trust the client alone).
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            // "new-password" tells password managers to offer a generated one.
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500 mt-1">Mindestens 8 Zeichen.</p>
        </div>

        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          // cursor-pointer because Tailwind v4 no longer defaults <button> to
          // a pointer cursor — without this, the button looks unclickable.
          className="w-full cursor-pointer"
        >
          {submitting ? "Lädt…" : "Konto erstellen"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Schon ein Konto?{" "}
        <Link to="/login" className="text-asta-red hover:underline">
          Hier einloggen
        </Link>
      </p>
    </section>
  );
}
