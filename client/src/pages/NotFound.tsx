// client/src/pages/NotFound.tsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-4 text-gray-600">Diese Seite gibt es leider nicht.</p>
      <Link to="/" className="mt-6 inline-block text-asta-red hover:underline">
        ← Zurück zur Startseite
      </Link>
    </section>
  );
}
