// client/src/pages/admin/gremien/AdminGremien.tsx
//
// Shell layout for the Gremium CMS admin section. Left sidebar lists the
// editable pages; right side renders the active page via React Router's
// nested <Outlet />. This way each "page" route renders inside the same
// layout — clicking a sidebar item is a route change, not a state change.
//
// When Baracke / Sport land in AW-25/26 they just add another sidebar
// entry pointing at the same AdminGremiumPage with their slug.

import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { slug: "asta", label: "AStA" },
  { slug: "stupa", label: "StuPa" },
  { slug: "fachschaften", label: "Fachschaften" },
];

export default function AdminGremien() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
      <aside className="w-48 shrink-0">
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Seiten
        </h2>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.slug}
              to={`/admin/gremien/${item.slug}`}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium ${
                  isActive
                    ? "bg-asta-red text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
