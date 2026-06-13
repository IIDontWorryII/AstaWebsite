// client/src/components/ImageLightbox.tsx
//
// Full-screen image popup. Render with a non-null `src` to open; closes on
// the X button, a backdrop click, or Escape. Used for member/referat
// portraits and gallery photos.

import { useEffect } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
  /** Image URL to show, or null when closed. */
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export default function ImageLightbox({
  src,
  alt = "",
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
      role="presentation"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Schließen"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
      />
    </div>
  );
}
