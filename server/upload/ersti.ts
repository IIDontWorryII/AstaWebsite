// server/upload/ersti.ts
//
// Multer config + R2 bridge for the Ersti-Info "Prüfungstermine" PDFs. Two
// optional files ride in one request: "mit" (Fachbereich MIT) and "wiso"
// (Fachbereich WiSo). Same shape as upload/protocols.ts (application/pdf only).

import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  uploadObject,
  deleteObject,
  publicUrl,
  keyFromPublicUrl,
} from "./storage.js";

const KEY_PREFIX = "ersti";
const ALLOWED_MIME_TYPES = new Set(["application/pdf"]);
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

const erstiUpload = multer({
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

/** Parse the optional "mit" + "wiso" PDF fields into req.files. */
export function parseErstiFiles(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  erstiUpload.fields([
    { name: "mit", maxCount: 1 },
    { name: "wiso", maxCount: 1 },
  ])(req, res, (err) => {
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

/** Upload one parsed PDF to R2 and return its public URL. */
export async function storeErstiFile(
  file: Express.Multer.File,
): Promise<string> {
  const key = `${KEY_PREFIX}/${randomUUID()}.pdf`;
  await uploadObject(key, file.buffer, file.mimetype);
  return publicUrl(key);
}

/** Delete an Ersti PDF from R2 given its stored public URL. */
export async function deleteErstiFileByUrl(
  storedUrl: string | null,
): Promise<void> {
  const key = keyFromPublicUrl(storedUrl);
  if (!key) return;
  await deleteObject(key);
}
