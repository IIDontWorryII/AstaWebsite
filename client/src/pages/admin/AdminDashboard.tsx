// client/src/pages/admin/AdminDashboard.tsx
//
// Landing page for EDITORs at /admin. Lists the editable areas as cards
// with a background photo + dark overlay so the white label stays readable.
// New admin areas just add an entry to CARDS.
//
// NOTE: the `image` paths point at existing photos in client/public as
// placeholders. Drop in dedicated photos (an event shot, a meeting shot,
// a gremien group shot) by replacing these files or changing the paths.

import { Link } from "react-router-dom";

const CARDS = [
  {
    to: "/admin/events",
    title: "Events",
    description: "Veranstaltungen anlegen, bearbeiten und löschen.",
    image: "/welcome-back-party.jpg",
  },
  {
    to: "/admin/protocols",
    title: "Protokolle",
    description: "Sitzungsprotokolle hochladen und verwalten.",
    image: "/Protocols.png",
  },
  {
    to: "/admin/mitglieder",
    title: "Mitglieder",
    description: "Referate & Mitglieder von AStA, StuPa und Fachschaften pflegen.",
    image: "/asta-team.jpg",
  },
  {
    to: "/admin/gremien",
    title: "Seiteninhalte",
    description: "AStA-, StuPa-, Fachschaften- und BaRACke-Seiten bearbeiten.",
    image: "/campus-photo.jpg",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Verwaltung</h1>
        <p className="text-sm text-gray-600 mt-1">
          Wähle einen Bereich, um Inhalte zu bearbeiten.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group relative block h-44 rounded-lg overflow-hidden shadow-sm"
          >
            <img
              src={card.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/45 transition group-hover:bg-black/55" />
            <div className="relative h-full p-6 flex flex-col justify-end text-white">
              <h2 className="text-xl font-bold">{card.title}</h2>
              <p className="text-sm text-white/85">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
