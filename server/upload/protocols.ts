// server/upload/protocols.ts
//
// Multer configuration for protocol-PDF uploads + R2 bridge helpers.
// Same shape as upload/events.ts, with mime restricted to application/pdf
// and a different bucket prefix.

import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  uploadObject,
  deleteObject,
  publicUrl,
  keyFromPublicUrl,
} from "./storage.js";

const KEY_PREFIX = "protocols";

const ALLOWED_MIME_TYPES = new Set(["application/pdf"]);

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export const protocolUpload = multer({
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

/** Upload a parsed multer file to R2 and return its public URL. */
export async function storeProtocolFile(
  file: Express.Multer.File,
): Promise<string> {
  const key = `${KEY_PREFIX}/${randomUUID()}.pdf`;
  await uploadObject(key, file.buffer, file.mimetype);
  return publicUrl(key);
}

/** Delete a protocol PDF from R2 given the stored public URL. */
export async function deleteProtocolFileByUrl(
  storedUrl: string | null,
): Promise<void> {
  const key = keyFromPublicUrl(storedUrl);
  if (!key) return;
  await deleteObject(key);
}
