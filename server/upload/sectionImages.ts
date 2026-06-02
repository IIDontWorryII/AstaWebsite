// server/upload/sectionImages.ts
//
// Multer + R2 bridge for images attached to PageSections (Gremium page
// photos: AStA team, Referat portraits, StuPa team, etc.).
//
// Identical shape to upload/events.ts — the only differences are:
//   - bucket prefix is "page-sections/" so we can locate / clean up
//     section images separately if needed
//   - field name on the multipart form is "image"
//
// We don't extract a generic helper between events.ts, sectionImages.ts,
// and (eventually) baracke/sport upload modules. Two-to-three near-
// identical modules are cheaper to read than a parameterized factory.

import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  uploadObject,
  deleteObject,
  publicUrl,
  keyFromPublicUrl,
} from "./storage.js";

const KEY_PREFIX = "page-sections";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export const sectionImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

export function parseSectionImage(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  sectionImageUpload.single("image")(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    const status =
      err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
        ? 413
        : 400;
    res.status(status).json({ error: err.message });
  });
}

export async function storeSectionImage(
  file: Express.Multer.File,
): Promise<string> {
  const key = `${KEY_PREFIX}/${randomUUID()}.${extensionForMime(file.mimetype)}`;
  await uploadObject(key, file.buffer, file.mimetype);
  return publicUrl(key);
}

export async function deleteSectionImageByUrl(
  storedUrl: string | null,
): Promise<void> {
  const key = keyFromPublicUrl(storedUrl);
  if (!key) return;
  await deleteObject(key);
}
