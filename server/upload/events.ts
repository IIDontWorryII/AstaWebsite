// server/upload/events.ts
//
// Multer configuration for event-poster uploads + helpers that bridge
// multer's in-memory buffer to R2 storage.
//
// Pipeline:
//   1. parseEventPoster (multer)  — parses multipart, validates mime &
//                                   size, puts bytes into req.file.buffer.
//                                   No file is written to local disk.
//   2. Route handler              — calls storeEventPoster(req.file) to
//                                   upload to R2 and get back the public
//                                   URL. Stores URL in the DB.
//   3. deleteEventPosterByUrl     — used on row delete/update to clean
//                                   up the corresponding object in R2.

import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  uploadObject,
  deleteObject,
  publicUrl,
  keyFromPublicUrl,
} from "./storage.js";

/** Prefix inside the bucket for event poster files. */
const KEY_PREFIX = "events";

/** Allowed image mime types — keep this list short and explicit. */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Max upload size — 20 MB. Generous enough for high-res JPEGs and PNG
 * posters from a phone (often 5-15 MB).
 */
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

/** Map a mime type to the file extension we use in storage. */
function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin"; // unreachable — fileFilter rejects unknown mimes first
  }
}

/**
 * Multer middleware (memory storage). Stores the file as a Buffer on
 * req.file.buffer rather than writing to local disk — we forward the
 * buffer to R2 in the route handler.
 */
export const eventPosterUpload = multer({
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

/**
 * Wraps `eventPosterUpload.single("image")` so multer errors (oversize,
 * disallowed mime, etc.) become structured 400/413 responses rather than
 * bubbling to Express's default 500 handler.
 */
export function parseEventPoster(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  eventPosterUpload.single("image")(req, res, (err) => {
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

/**
 * Upload a parsed multer file to R2 and return its public URL.
 * Caller stores the URL in the DB.
 *
 * Throws if the upload fails (route's try/catch will turn it into 500).
 */
export async function storeEventPoster(
  file: Express.Multer.File,
): Promise<string> {
  const key = `${KEY_PREFIX}/${randomUUID()}.${extensionForMime(file.mimetype)}`;
  await uploadObject(key, file.buffer, file.mimetype);
  return publicUrl(key);
}

/**
 * Delete an event poster from R2 given the public URL stored in the DB.
 * Silent no-op if the URL is null or doesn't belong to our storage
 * (defensive — old rows or manually edited data shouldn't crash).
 */
export async function deleteEventPosterByUrl(
  storedUrl: string | null,
): Promise<void> {
  const key = keyFromPublicUrl(storedUrl);
  if (!key) return;
  await deleteObject(key);
}
