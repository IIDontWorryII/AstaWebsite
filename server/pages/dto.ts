// server/pages/dto.ts
//
// Wire-shape converters for Page + PageSection. Used by both the public
// GET /api/pages/:slug and the admin write endpoints.

import type {
  Page as PrismaPage,
  PageSection as PrismaPageSection,
} from "@prisma/client";
import type { PageDTO, PageSectionDTO } from "../../shared/types.js";

export function toPageSectionDTO(s: PrismaPageSection): PageSectionDTO {
  return {
    id: s.id,
    order: s.order,
    kind: s.kind,
    subtitle: s.subtitle,
    body: s.body,
    imageUrl: s.imageUrl,
    caption: s.caption,
    email: s.email,
  };
}

export function toPageDTO(
  page: PrismaPage & { sections: PrismaPageSection[] },
): PageDTO {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    intro: page.intro,
    sections: page.sections.map(toPageSectionDTO),
  };
}
