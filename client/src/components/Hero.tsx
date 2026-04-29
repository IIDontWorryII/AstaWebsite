// client/src/components/Hero.tsx

export default function Hero() {
  return (
    <section className="bg-[url(/hero-campus.png)] bg-[size:100%_blank] bg-no-repeat bg-right rounded-br-[6rem]">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          <span className="block">AStA Remagen</span>
          <span className="block text-asta-red">Dein RheinAhrCampus</span>
        </h1>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#"
            className="bg-asta-red hover:bg-asta-red-dark text-white px-6 py-3 rounded-md font-medium"
          >
            Über den AStA
          </a>
          <a
            href="#"
            className="border-2 border-asta-red text-asta-red hover:bg-asta-red hover:text-white px-6 py-3 rounded-md font-medium"
          >
            Mitmachen
          </a>
        </div>
      </div>
    </section>
  );
}
