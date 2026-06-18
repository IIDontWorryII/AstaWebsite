// server/html/sanitize.ts
//
// Rich-text fields (page section body, event description) are stored as HTML
// produced by the admin TipTap editor. Even though only authenticated EDITORs
// can write them, we sanitize on the server before persisting — defense in
// depth, because the public pages render this HTML with
// dangerouslySetInnerHTML. Anything outside the allowlist is stripped.

import sanitizeHtmlLib from "sanitize-html";

// The exact tag set our editor can produce: paragraphs + line breaks, inline
// marks (bold/italic/underline/strike), links, the two heading levels we offer,
// lists, blockquotes, and the <span style="color"> the colour mark emits.
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "a",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "span",
];

/**
 * Sanitize editor HTML down to our allowlist. Disallowed tags are removed but
 * their text content is kept, so pasted rich content degrades to plain text
 * rather than vanishing. Links are forced to safe schemes and get
 * rel="noopener nofollow"; the colour mark's inline `color` style is allowed.
 */
export function sanitizeRichText(input: string): string {
  return sanitizeHtmlLib(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Only a text colour is permitted on spans (hex or rgb/rgba).
    allowedStyles: {
      span: {
        color: [
          /^#(0x)?[0-9a-f]+$/i,
          /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/i,
        ],
      },
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener nofollow",
        },
      }),
    },
  });
}

/**
 * True when the editor HTML carries no visible content. TipTap serializes an
 * empty document as "<p></p>"; after stripping tags and whitespace there is
 * nothing left. Used to map an empty editor back to "" so existing
 * "empty string clears the field" semantics keep working.
 */
export function isEmptyRichText(input: string): boolean {
  const text = sanitizeHtmlLib(input, { allowedTags: [], allowedAttributes: {} });
  return text.replace(/\s|&nbsp;/g, "") === "";
}
