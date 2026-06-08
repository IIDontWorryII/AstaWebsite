// client/src/components/Hero.tsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-[url(/hero-campus.webp)] bg-no-repeat bg-right rounded-br-[6rem]">
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          <span className="block">AStA Remagen</span>
          <span className="block text-asta-red">Dein RheinAhrCampus</span>
        </h1>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            size="brand"
            render={<Link to="/gremien/asta" />}
            nativeButton={false}
          >
            Über den AStA
          </Button>
          <Button
            variant="brandOutline"
            size="brand"
            render={<Link to="/kontakt" />}
            nativeButton={false}
          >
            Mitmachen
          </Button>
        </div>
      </div>
    </section>
  );
}
