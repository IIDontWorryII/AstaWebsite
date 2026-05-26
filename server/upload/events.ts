// server/upload/events.ts
//
// Multer configuration for event-poster uploads.
//
// What multer does: parses multipart/form-data requests (the format a
// browser uses when an <input type="file"> is submitted) and either saves
// the file to disk or hands you the bytes. We use the disk variant — files
// land in server/uploads/events/ with collision-proof generated names.
//
// What we validate:
//   - Mime type whitelist: only common web image formats. Anything else
//     is rejected before the file is written.
//   - Size limit: 5 MB per file. Stops accidental 50 MB uploads from
//     filling the disk and saves us bandwidth.
//
// What we DON'T do here:
//   - Authentication. The route applies requireEditor before multer runs,
//     so by the time we get here the request is already authorized.
//   - Image processing (resize, strip EXIF). Out of scope for AW-36.

import { randomUUID } from "node:crypto";
import path from "node:path";
import { unlink } from "node:fs/promises";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";

/** Absolute path to the directory where event posters are stored. */
export const EVENTS_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "events",
);

/** Public URL prefix the browser uses to fetch uploaded files. */
export const EVENTS_PUBLIC_PREFIX = "/uploads/events";

/** Allowed image mime types — keep this list short and explicit. */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Max upload size in bytes — 5 MB. */
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Map a mime type to the file extension we use on disk. We pick the
 * extension from the mime type (not the user-supplied filename) so a
 * malicious "harmless.jpg.exe" name can never reach the filesystem.
 */
function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".bin"; // never reached — fileFilter rejects unknown mimes first
  }
}

/**
 * Multer middleware for event poster uploads. Use as:
 *   app.post("/api/events", requireEditor, eventPosterUpload.single("image"),
 *            async (req, res) => { ... });
 *
 * After multer runs, `req.file` holds metadata about the saved file
 * (filename, path, size, mimetype) — undefined if no file was uploaded.
 */
export const eventPosterUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, EVENTS_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      // randomUUID gives us a collision-proof name and prevents path-traversal
      // attacks via crafted filenames (e.g. "../../etc/passwd").
      cb(null, `${randomUUID()}${extensionForMime(file.mimetype)}`);
    },
  }),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      // Pass an Error to reject the upload; the route's error handler
      // converts it to a 400 response.
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

/**
 * Build the public URL for an uploaded file given its on-disk filename.
 * Stored in the DB's `imageUrl` field and returned to the client.
 */
export function publicUrlFor(filename: string): string {
  return `${EVENTS_PUBLIC_PREFIX}/${filename}`;
}

/**
 * Wraps `eventPosterUpload.single("image")` so multer errors (oversize file,
 * disallowed mime type, etc.) become structured 400 responses rather than
 * bubbling to Express's default 500 handler.
 *
 * Use this in routes instead of calling multer directly:
 *   app.post("/api/events", requireEditor, parseEventPoster, async (...) => {});
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
    // 413 Payload Too Large for size errors; 400 for everything else
    // (unsupported mime, malformed multipart, etc.).
    const status =
      err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
        ? 413
        : 400;
    res.status(status).json({ error: err.message });
  });
}

/**
 * Delete an uploaded event poster from disk given its public URL.
 * Silently ignores ENOENT (file already gone) — callers don't need to
 * care whether the file existed.
 */
export async function deleteEventPosterByUrl(
  publicUrl: string | null,
): Promise<void> {
  if (!publicUrl) return;
  const filename = path.basename(publicUrl);
  const onDisk = path.join(EVENTS_UPLOAD_DIR, filename);
  try {
    await unlink(onDisk);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}
