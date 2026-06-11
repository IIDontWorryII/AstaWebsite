// client/src/components/GremiumBadge.tsx
//
// Small colour-coded badge for a gremium (AStA = red, StuPa = blue, others
// grey). Shared by the admin protocol list and the home protocol sidebar so
// the colour coding is consistent everywhere.

interface GremiumBadgeProps {
  gremium: string;
}

const PALETTE: Record<string, string> = {
  ASTA: "bg-asta-red text-white",
  STUPA: "bg-blue-600 text-white",
};

export default function GremiumBadge({ gremium }: GremiumBadgeProps) {
  const className = PALETTE[gremium] ?? "bg-gray-300 text-gray-800";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${className}`}
    >
      {gremium}
    </span>
  );
}
