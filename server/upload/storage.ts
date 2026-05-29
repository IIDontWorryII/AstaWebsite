// server/upload/storage.ts
//
// Thin wrapper around Cloudflare R2 (S3-compatible object storage).
// All file uploads (event posters, protocol PDFs) live here so the rest
// of the app can call `uploadObject` / `deleteObject` / `publicUrl`
// without knowing what storage backend is underneath.
//
// Why a wrapper rather than calling the S3 SDK directly from routes:
//   - Single chokepoint for credentials/config (one env var check)
//   - Tests can mock this whole module via vi.mock('./upload/storage')
//     and don't need to know about S3 commands or AWS SDK shapes
//   - Future swap (S3, GCS, local disk for dev) only changes this file
//
// All env vars are required and validated on module load — if any are
// missing the server refuses to start (loud failure beats silent broken
// uploads at 2am).

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// ─── Config (read once, validated on module load) ──────────────────────

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `${name} is not set. See server/.env.example for the full list of R2 vars.`,
    );
  }
  return v;
}

const R2_ENDPOINT = requireEnv("R2_ENDPOINT");
const R2_BUCKET = requireEnv("R2_BUCKET");
const R2_ACCESS_KEY_ID = requireEnv("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = requireEnv("R2_SECRET_ACCESS_KEY");
const R2_PUBLIC_URL = requireEnv("R2_PUBLIC_URL").replace(/\/$/, ""); // strip trailing /

// ─── S3 client (singleton) ─────────────────────────────────────────────
//
// R2 speaks the S3 API. The S3 SDK works with R2 as long as we set:
//   - endpoint: R2's URL (not AWS S3's)
//   - region: "auto" (R2 doesn't use AWS regions)
//   - forcePathStyle: false (R2 uses subdomain-style: bucket.endpoint/key)

const client = new S3Client({
  endpoint: R2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

// ─── Public API ────────────────────────────────────────────────────────

/**
 * Upload a file's bytes to the bucket under the given key.
 * Key examples: "events/uuid.jpg", "protocols/uuid.pdf".
 * Content-Type lets the browser render the file correctly on download.
 */
export async function uploadObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/**
 * Delete an object by key. Tolerant of already-missing objects (R2
 * returns 204 even when the key didn't exist, so no special handling
 * needed — unlike fs.unlink which throws ENOENT).
 */
export async function deleteObject(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
  );
}

/**
 * Public URL the browser can use to fetch the object. Composes R2's
 * configured public domain with the key. We DON'T store this URL in
 * the database for non-image data (e.g. metadata only), but for event
 * posters and protocol PDFs we do store the full URL — it's the
 * convention the frontend already uses.
 */
export function publicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Extract the storage key from a previously-stored public URL. Used by
 * delete handlers (we store the full URL in the DB, but deleteObject
 * needs the key alone).
 *
 * Returns null if the URL doesn't belong to our storage — defensive
 * against bad data (manually edited rows, old data from before R2, etc.)
 * so a bad URL doesn't crash the request.
 */
export function keyFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  if (!url.startsWith(R2_PUBLIC_URL + "/")) return null;
  return url.slice(R2_PUBLIC_URL.length + 1);
}
