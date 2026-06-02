// client/src/pages/admin/gremien/EditableSection.tsx
//
// Wraps a public section component (InfoSection, ReferatCard, etc.) in a
// relative box with admin controls in the top-right:
//   - Edit button       (always present)
//   - Move-up / -down   (optional — only shown for kinds that support it)
//   - Delete            (optional — only shown for REFERAT, the only
//                       kind that can be added/removed)
//
// The wrapper deliberately doesn't know what's inside it — children render
// the actual section. Same component is used regardless of section kind.

import type { ReactNode } from "react";
import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface EditableSectionProps {
  children: ReactNode;
  onEdit: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function EditableSection({
  children,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: EditableSectionProps) {
  return (
    <div className="relative group">
      {/* Floating control bar — top-right, semi-opaque so it doesn't
          dominate the rendered section. */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/90 backdrop-blur-sm rounded-md p-1 border border-gray-200 shadow-sm">
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            title="Nach oben verschieben"
            className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            title="Nach unten verschieben"
            className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          title="Bearbeiten"
          className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Löschen"
            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* The actual section rendering — unchanged from the public view. */}
      <div className="border border-dashed border-gray-200 rounded-lg p-4">
        {children}
      </div>
    </div>
  );
}
