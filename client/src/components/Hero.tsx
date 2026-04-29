// client/src/components/Hero.tsx

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: text + CTAs */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="block">AStA Remagen</span>
            <span className="block text-asta-red">Dein RheinAhrCampus</span>
          </h1>

          <div className="mt-8 flex flex-wrap gap-4">
            {/* Primary — filled */}
            <a
              href="#"
              className="bg-asta-red hover:bg-asta-red-dark text-white
                          px-6 py-3 rounded-md font-medium"
            >
              Über den AStA
            </a>
            {/* Secondary — outlined */}
            <a
              href="#"
              className="border-2 border-asta-red text-asta-red
                          hover:bg-asta-red hover:text-white
                          px-6 py-3 rounded-md font-medium"
            >
              Mitmachen
            </a>
          </div>
        </div>

        {/* Right: image */}
        <div>
          <img
            src="/hero-campus.png"
            alt="RheinAhrCampus Remagen"
            className="w-full h-auto rounded-2xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
