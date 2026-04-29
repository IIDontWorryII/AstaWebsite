// client/src/components/EventsSection.tsx

export default function EventsSection() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Welcome Back Party",
      date: "09.04.2026",
      time: "20 Uhr",
      image: "/welcome-back-party.jpg",
    },
    {
      id: 2,
      title: "Night Beach",
      date: "06.05.2026",
      time: "20 Uhr",
      image: "/night-beach.jpg",
    },
    {
      id: 3,
      title: "Sound Of Summer",
      date: "30.06.2026",
      time: "18 Uhr",
      image: "/sound-of-summer.jpg",
    },
  ];

  const recentProtocols = [
    {
      id: 1,
      title: "Protokoll AStA-Sitzung 2026-04-15",
      file: "/protokolle/2026-04-15.pdf",
    },
    {
      id: 2,
      title: "Protokoll AStA-Sitzung 2026-04-01",
      file: "/protokolle/2026-04-01.pdf",
    },
    {
      id: 3,
      title: "Protokoll AStA-Sitzung 2026-03-18",
      file: "/protokolle/2026-03-18.pdf",
    },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* One outer 4-col grid holds heading, cards, AND sidebar.
            - Heading: row 1 cols 1-3 (col 4 of row 1 stays empty)
            - Cards:   row 2 cols 1-3
            - Sidebar: row 2 col 4
            CSS Grid stretches row 2 → sidebar height = cards height. */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-0">
          {/* Heading row — spans 3 cols so right edge aligns with card 3 */}
          <div className="lg:col-span-3 flex items-end justify-between mb-6">
            <h2 className="text-3xl font-bold">Bevorstehende Events</h2>
            <a
              href="#"
              className="text-asta-red hover:text-asta-red-dark font-medium"
            >
              Alle Events anzeigen →
            </a>
          </div>

          {/* Cards row — 3-up grid spanning cols 1-3 */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <article
                key={event.id}
                className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.date} · {event.time}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">noch 3 Tage</p>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar: spans 1 column, naturally same height as cards row */}
          <aside className="lg:col-span-1 bg-gray-100 rounded-2xl p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-4">Sitzungsprotokolle</h3>
            <ul className="space-y-3 flex-1">
              {recentProtocols.map((p) => (
                <li key={p.id}>
                  <a
                    href={p.file}
                    download
                    className="bg-white rounded-lg p-3 flex items-center justify-between hover:bg-asta-red hover:text-white"
                  >
                    <span className="text-sm">{p.title}</span>
                    <span aria-hidden>↓</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
