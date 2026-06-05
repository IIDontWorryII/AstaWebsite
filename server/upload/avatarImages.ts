// server/upload/avatarImages.ts
//
// Multer + R2 bridge for user avatar images. Same shape as
// upload/sectionImages.ts; only the bucket prefix ("avatars/") and the
// multipart field name ("avatar") differ.

import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  uploadObject,
  deleteObject,
  publicUrl,
  keyFromPublicUrl,
} from "./storage.js";

const KEY_PREFIX = "avatars";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

export const avatarImageUpload = multer({
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

export function parseAvatarImage(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  avatarImageUpload.single("avatar")(req, res, (err) => {
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

export async function storeAvatarImage(
  file: Express.Multer.File,
): Promise<string> {
  const key = `${KEY_PREFIX}/${randomUUID()}.${extensionForMime(file.mimetype)}`;
  await uploadObject(key, file.buffer, file.mimetype);
  return publicUrl(key);
}

export async function deleteAvatarImageByUrl(
  storedUrl: string | null,
): Promise<void> {
  const key = keyFromPublicUrl(storedUrl);
  if (!key) return;
  await deleteObject(key);
}
