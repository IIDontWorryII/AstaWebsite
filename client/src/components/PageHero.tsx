// client/src/components/PageHero.tsx
//
// Full-width hero banner used at the top of sub-pages (gremien, BaRACke,
// sport): a background photo with a dark overlay, plus either a logo or a
// title and an optional tagline. The image is the LCP for these pages, so
// it loads eagerly with high priority (never lazy).

interface PageHeroProps {
  /** Background image (use an optimized .webp). */
  image: string;
  /** Optional logo shown on the overlay. */
  logo?: string;
  /** Title — shown as the heading when there's no logo; otherwise used as an
   *  invisible (screen-reader) page heading so the page still has an h1. */
  title: string;
  subtitle?: string;
}

export default function PageHero({
  image,
  logo,
  title,
  subtitle,
}: PageHeroProps) {
  return (
    <section className="relative h-64 md:h-64">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-start text-white">
        {logo ? (
          <>
            <img
              src={logo}
              alt={title}
              className="h-20 md:h-28 w-auto mb-4 drop-shadow-lg"
            />
            <h1 className="sr-only">{title}</h1>
          </>
        ) : (
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg md:text-2xl font-medium max-w-xl mt-3 drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
