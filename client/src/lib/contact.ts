// client/src/lib/contact.ts
//
// The AStA's public contact address, stored as split parts so the full string
// never appears verbatim in the source or the built JS bundle (basic bot-
// harvest resistance — see components/ObfuscatedMailLink). AW-73.
//
// This is the single source of truth for the address; it was previously
// copy-pasted as a literal `mailto:` in the footer, Impressum, Kontakt and
// Barrierefreiheit pages.
export const ASTA_CONTACT = {
  user: "rac-asta-vorsitz",
  domain: "rheinahrcampus.de",
} as const;
