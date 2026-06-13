// client/src/components/PageHero.tsx
//
// Full-width hero banner used at the top of sub-pages. A background photo
// with a bottom-up gradient and the title + optional subtitle anchored at
// the bottom-left — so the bright top of the photo (faces) stays clear and
// the text sits in the dark gradient band. The image is the LCP, so it
// loads eagerly with high priority.
//
//   - object-position: top keeps heads in frame on group photos
//   - `compact` gives a shorter hero (used on the Eventkalender)

interface PageHeroProps {
  /** Background image (use an optimized .webp/.jpg). */
  image: string;
  /** Page title — also serves as the h1 for the page. */
  title: string;
  subtitle?: string;
  /** Shorter hero (e.g. the Eventkalender, where a tall hero crowds out the calendar). */
  compact?: boolean;
}

export default function PageHero({
  image,
  title,
  subtitle,
  compact,
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden ${compact ? "h-72 md:h-80" : "h-72 md:h-128"}`}
    >
      <img
        src={image}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end items-start text-white pb-8 md:pb-10">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-2xl font-medium max-w-xl mt-2 drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
