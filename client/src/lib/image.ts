// client/src/lib/image.ts
//
// Client-side image downscaling/compression run BEFORE upload. Camera and
// phone photos are often several megabytes at 4000–7000 px wide; uploading
// them raw makes uploads slow AND makes every visitor download a huge file.
// We shrink + re-encode to WebP so stored images are ~100–300 KB.
//
//   - cap the longest edge at MAX_DIMENSION
//   - re-encode to WebP (smaller than JPEG at equal quality); fall back to
//     JPEG if the browser can't encode WebP
//   - preserve EXIF orientation (so portrait photos aren't rotated)
//   - if the result isn't actually smaller, keep the original
//
// Any failure (unsupported type, no canvas, decode error) returns the
// original file — compression must never block an upload.

const MAX_DIMENSION = 1600; // longest edge, in pixels
const QUALITY = 0.82; // 0–1

/**
 * Return a (usually) much smaller version of `file` suitable for upload. On
 * any failure or when compression wouldn't help, returns the original.
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
    if (typeof ImageBitmap !== "undefined" && bitmap instanceof ImageBitmap) {
      bitmap.close();
    }

    // Prefer WebP; fall back to JPEG if the browser didn't produce WebP.
    let blob = await toBlob(canvas, "image/webp", QUALITY);
    let outType = "image/webp";
    let ext = ".webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await toBlob(canvas, "image/jpeg", QUALITY);
      outType = "image/jpeg";
      ext = ".jpg";
    }

    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, "") + ext;
    return new File([blob], newName, { type: outType });
  } catch {
    return file;
  }
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Decode a File into something drawable on a canvas (EXIF-oriented). */
async function loadImage(
  file: File,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  }
  // Fallback: modern browsers already apply EXIF orientation when rendering
  // an <img>, so drawing it to the canvas uses the corrected orientation.
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
