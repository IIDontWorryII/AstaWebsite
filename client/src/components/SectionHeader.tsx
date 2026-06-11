// client/src/components/SectionHeader.tsx
//
// Consistent section heading: title + the red underline accent from the
// design concept, with an optional subtitle. Used by the gremien/baracke/
// sport section components so every block looks intentional and uniform.

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Heading element to render (default h2). */
  as?: "h1" | "h2" | "h3";
}

export default function SectionHeader({
  title,
  subtitle,
  as: Tag = "h2",
}: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <Tag className="text-2xl md:text-3xl font-bold">{title}</Tag>
      <div className="mt-2 h-1 w-12 rounded bg-asta-red" />
      {subtitle && (
        <p className="mt-3 text-gray-600 max-w-prose">{subtitle}</p>
      )}
    </div>
  );
}
