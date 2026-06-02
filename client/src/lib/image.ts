// client/src/lib/image.ts
//
// Client-side image downscaling/compression run BEFORE upload. Phone photos
// are often 4000+ px wide and several megabytes; uploading them raw means
// the bytes travel the wire twice (browser → server → R2) at full size,
// which is the main reason uploads felt slow (15–25s).
//
// We keep the compression GENTLE on purpose — quality matters more than
// squeezing the last kilobyte:
//   - only shrink when the longest edge exceeds MAX_DIMENSION
//   - re-encode JPEGs at high quality (0.85)
//   - leave PNGs as PNGs (preserves transparency for logos etc.)
//   - if the result isn't actually smaller, keep the original untouched
//
// Anything that goes wrong (unsupported type, canvas unavailable, decode
// error) falls back to returning the original file — compression must never
// block an upload.

const MAX_DIMENSION = 2000; // longest edge, in pixels
const JPEG_QUALITY = 0.85; // 0–1; high = better quality, larger file

/**
 * Return a (usually) smaller version of `file` suitable for upload. On any
 * failure or when compression wouldn't help, returns the original file.
 */
export async function compressImage(file: File): Promise<File> {
  // Only raster images we know how to re-encode. SVG/PDF/etc. pass through.
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  try {
    const bitmap = await loadImage(file);
    const { width, height } = bitmap;
    if (!width || !height) return file;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    // ImageBitmap holds GPU/CPU memory until closed; HTMLImageElement doesn't.
    if (typeof ImageBitmap !== "undefined" && bitmap instanceof ImageBitmap) {
      bitmap.close();
    }

    // Keep PNG as PNG (transparency); re-encode everything else as JPEG.
    const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(
        resolve,
        outType,
        outType === "image/jpeg" ? JPEG_QUALITY : undefined,
      ),
    );
    if (!blob || blob.size >= file.size) return file;

    const ext = outType === "image/png" ? ".png" : ".jpg";
    const newName = file.name.replace(/\.\w+$/, "") + ext;
    return new File([blob], newName, { type: outType });
  } catch {
    return file;
  }
}

/** Decode a File into something drawable on a canvas. */
async function loadImage(
  file: File,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return await createImageBitmap(file);
  }
  return await new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
