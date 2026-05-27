// server/upload/protocols.ts
//
// Multer configuration for protocol-PDF uploads. Same shape as
// upload/events.ts, with these differences:
//   - mime whitelist: application/pdf only
//   - extension: .pdf
//   - storage folder: server/uploads/protocols/
//   - upload field name: "file" (an HTML form's `<input type="file" name="file">`)
//
// We deliberately keep this as a separate file from upload/events.ts
// rather than extracting a generic helper. Two near-identical files are
// cheaper to read and change than a parameterized factory. If a third
// upload kind ever appears (e.g. a Getränkekarte image), we'll extract
// then with three concrete cases to design against.

import { randomUUID } from "node:crypto";
import path from "node:path";
import { unlink } from "node:fs/promises";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";

/** Absolute path to the directory where protocol PDFs are stored. */
export const PROTOCOLS_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "protocols",
);

/** Public URL prefix the browser uses to fetch uploaded PDFs. */
export const PROTOCOLS_PUBLIC_PREFIX = "/uploads/protocols";

/** Only PDFs allowed for protocols (per project_overview.md). */
const ALLOWED_MIME_TYPES = new Set(["application/pdf"]);

/**
 * Max upload size in bytes — 20 MB. Same as event posters for consistency.
 * Most meeting minutes PDFs are 100 KB - 2 MB; the limit only matters if
 * someone uploads a giant scanned PDF.
 */
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

/**
 * Multer middleware for protocol uploads. Reads a file from the "file"
 * form field. After multer runs, `req.file` holds metadata about the
 * saved PDF.
 */
export const protocolUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, PROTOCOLS_UPLOAD_DIR);
    },
    filename: (_req, _file, cb) => {
      // UUID-based filename: collision-proof + ignores the client-supplied
      // name (prevents path-traversal attacks like "../../etc/passwd").
      cb(null, `${randomUUID()}.pdf`);
    },
  }),
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
 * Wraps `protocolUpload.single("file")` so multer errors (oversize,
 * disallowed mime type, etc.) become structured 400/413 responses instead
 * of bubbling to Express's default 500 handler.
 */
export function parseProtocolFile(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  protocolUpload.single("file")(req, res, (err) => {
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

/** Build the public URL for an uploaded protocol PDF. */
export function publicUrlFor(filename: string): string {
  return `${PROTOCOLS_PUBLIC_PREFIX}/${filename}`;
}

/**
 * Delete a protocol PDF from disk given its public URL. ENOENT-tolerant
 * (file already gone = success).
 */
export async function deleteProtocolFileByUrl(
  publicUrl: string | null,
): Promise<void> {
  if (!publicUrl) return;
  const filename = path.basename(publicUrl);
  const onDisk = path.join(PROTOCOLS_UPLOAD_DIR, filename);
  try {
    await unlink(onDisk);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}
