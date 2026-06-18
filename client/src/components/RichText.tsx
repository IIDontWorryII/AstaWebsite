// client/src/components/RichText.tsx
//
// Renders stored rich-text HTML (produced by the admin RichTextEditor) on the
// public pages. The HTML is sanitized server-side on every write, so it is
// safe to render with dangerouslySetInnerHTML here. Tailwind Typography's
// `prose` classes give headings/lists/links sensible spacing; brand-red links
// match the rest of the site.

interface RichTextProps {
  /** Sanitized HTML string from the server. */
  html: string;
  /** Extra classes for the wrapper (e.g. width, spacing, `prose-sm`). */
  className?: string;
}

export default function RichText({ html, className }: RichTextProps) {
  return (
    <div
      className={`prose prose-neutral max-w-none text-gray-700 prose-a:text-asta-red prose-headings:text-gray-900 ${
        className ?? ""
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
