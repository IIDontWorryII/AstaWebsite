// server/html/plainTextToHtml.ts
//
// One-time migration helper: the rich-text fields (page section body, event
// description) used to hold plain text. Now they hold HTML produced by the
// TipTap editor and rendered via dangerouslySetInnerHTML. This converts the
// legacy plain text into equivalent HTML so old content still renders with
// correct paragraph breaks instead of collapsing into one run-on line.
//
// Used by prisma/migrate-richtext.ts. Kept separate (and tested) so the
// conversion logic is verifiable without a database.

// Tags our editor/sanitizer can produce. If a stored value already contains
// one of these, it has been through the editor and must NOT be re-wrapped.
const HTML_TAG_RE =
  /<\/?(p|br|strong|em|u|s|a|h2|h3|ul|ol|li|blockquote|span)\b[^>]*>/i;

/**
 * True when the value already looks like editor HTML (contains one of our
 * known tags). Used to keep the migration idempotent — re-running it never
 * double-wraps content that has already been converted or freshly edited.
 */
export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_RE.test(value);
}

/** Escape the characters that would otherwise be interpreted as HTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Convert legacy plain text to HTML:
 *   - blank lines separate paragraphs (`<p>…</p>`)
 *   - a single newline inside a paragraph becomes `<br>`
 *   - HTML-special characters are escaped
 * Returns "" for empty/whitespace-only input.
 */
export function plainTextToHtml(text: string): string {
  const trimmed = text.trim();
  if (trimmed === "") return "";

  return trimmed
    .split(/\n\s*\n/) // blank line(s) → paragraph boundary
    .map((para) => para.trim())
    .filter((para) => para !== "")
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
