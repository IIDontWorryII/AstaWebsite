// client/src/lib/socials.ts
//
// Single source of truth for the AStA's social media URLs, used by both the
// header and the footer. Update here and both update.

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/asta_remagen/",
  tiktok: "https://www.tiktok.com/@asta_remagen",
} as const;

// "Über uns" Gremien video shown in the footer. We link out to YouTube with a
// locally-hosted thumbnail (see /ueber-uns-video.webp) instead of embedding an
// iframe — that keeps the site free of YouTube/Google cookies and the cookie
// banner that would otherwise require.
export const ABOUT_VIDEO_URL = "https://www.youtube.com/watch?v=IzE7e7AfZXs";
