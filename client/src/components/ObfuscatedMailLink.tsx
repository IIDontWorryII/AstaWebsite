// client/src/components/ObfuscatedMailLink.tsx
//
// A mailto link that resists e-mail harvesting (AW-73). The full address and
// the `mailto:` href are NOT present in the rendered DOM until the user
// actually interacts with the link (hover, keyboard focus, or tap). Bots that
// scrape the static markup — or crawl the JS bundle for a contiguous
// `mailto:foo@bar` string — come up empty; real users get a working link.
//
// Pass either a full `email` string (for values coming from the API/DB) or a
// split `user` + `domain` pair (preferred for hardcoded addresses, so the
// literal never lands in the bundle). Until revealed, the default label shows
// "user [at] domain".

import { useState, type MouseEvent, type ReactNode } from "react";

interface ObfuscatedMailLinkProps {
  /** Full address, e.g. from `section.email`. Alternatively pass user+domain. */
  email?: string;
  /** Local part (before the @). Use with `domain` to keep literals out of the bundle. */
  user?: string;
  /** Domain part (after the @). */
  domain?: string;
  /** Optional mailto subject line. */
  subject?: string;
  className?: string;
  /** Accessible name — useful when `children` is an icon rather than text. */
  ariaLabel?: string;
  /** Custom visible content; defaults to the obfuscated "user [at] domain". */
  children?: ReactNode;
}

export default function ObfuscatedMailLink({
  email,
  user,
  domain,
  subject,
  className,
  ariaLabel,
  children,
}: ObfuscatedMailLinkProps) {
  const [localPart, domainPart] = email
    ? email.split("@")
    : [user ?? "", domain ?? ""];

  // The real href is only ever put into state once the user interacts.
  const [href, setHref] = useState<string>();

  function build(): string {
    const address = `${localPart}@${domainPart}`;
    const mailto = subject
      ? `mailto:${address}?subject=${encodeURIComponent(subject)}`
      : `mailto:${address}`;
    setHref(mailto);
    return mailto;
  }

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // On a touch tap there's no hover/focus first, so the href may not be set
    // yet in this render. Build it now and navigate manually so the first tap
    // still opens the mail client.
    if (!href) {
      e.preventDefault();
      window.location.href = build();
    }
  }

  return (
    <a
      href={href ?? "#"}
      className={className}
      aria-label={ariaLabel}
      rel="nofollow"
      onMouseEnter={build}
      onFocus={build}
      onClick={handleClick}
    >
      {children ?? `${localPart} [at] ${domainPart}`}
    </a>
  );
}
