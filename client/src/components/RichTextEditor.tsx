// client/src/components/RichTextEditor.tsx
//
// A small WYSIWYG editor for the admin text fields (page section body, event
// description). Built on TipTap; emits HTML via onChange. The HTML is
// sanitized again on the server before it is stored, and rendered on the
// public pages inside Tailwind Typography `prose` styles.
//
// Toolbar: bold, italic, underline, bullet + numbered lists, H2/H3, link,
// text colour. An "empty" document serializes to "<p></p>"; callers should
// treat that as empty (see isEmptyHtml).

import { useEffect, useState } from "react";
import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Palette,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** id of a label that describes this field (for accessibility). */
  ariaLabel?: string;
}

/** Preset swatches offered in the colour menu, plus a custom picker. */
const COLORS = [
  { label: "AStA-Rot", value: "#9d1006" },
  { label: "Schwarz", value: "#111111" },
  { label: "Grau", value: "#6b7280" },
  { label: "Grün", value: "#15803d" },
  { label: "Blau", value: "#1d4ed8" },
];

/** True when TipTap HTML carries no visible text (empty document). */
export function isEmptyHtml(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").replace(/\s|&nbsp;/g, "") === "";
}

export default function RichTextEditor({
  value,
  onChange,
  ariaLabel,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener nofollow", target: "_blank" },
        },
      }),
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        // `prose` defaults body text to a soft gray; override the typography
        // colour variable so editors type in near-black for better contrast.
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-40 px-3 py-2 [--tw-prose-body:var(--color-gray-900)]",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    },
  });

  // Keep the editor in sync when the parent swaps in different content (e.g. a
  // drawer reopening on another section). Guarded so it doesn't fire on every
  // keystroke and reset the cursor.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded overflow-hidden focus-within:border-asta-red">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [showColors, setShowColors] = useState(false);

  // v3's useEditor does not re-render on every transaction; useEditorState
  // subscribes to just the active-mark flags we need so the toolbar
  // highlights stay in sync with the cursor.
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      link: editor.isActive("link"),
    }),
  });

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link-URL (leer lassen zum Entfernen):", previous ?? "");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
      <Btn
        label="Fett"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn
        label="Kursiv"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Btn>
      <Btn
        label="Unterstrichen"
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Btn>

      <Divider />

      <Btn
        label="Überschrift 2"
        active={state.h2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn
        label="Überschrift 3"
        active={state.h3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Btn>

      <Divider />

      <Btn
        label="Aufzählung"
        active={state.bullet}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Btn>
      <Btn
        label="Nummerierte Liste"
        active={state.ordered}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Btn>

      <Divider />

      <Btn label="Link" active={state.link} onClick={setLink}>
        <LinkIcon className="h-4 w-4" />
      </Btn>

      {/* Text colour menu. */}
      <div className="relative">
        <Btn
          label="Textfarbe"
          active={showColors}
          onClick={() => setShowColors((s) => !s)}
        >
          <Palette className="h-4 w-4" />
        </Btn>
        {showColors && (
          <div
            className="absolute z-10 mt-1 flex flex-col gap-2 rounded border border-gray-200 bg-white p-2 shadow-lg"
            role="menu"
          >
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  aria-label={c.label}
                  onClick={() => {
                    editor.chain().focus().setColor(c.value).run();
                    setShowColors(false);
                  }}
                  className="h-6 w-6 rounded-full border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setShowColors(false);
              }}
              className="text-xs text-gray-600 hover:text-asta-red cursor-pointer text-left"
            >
              Farbe entfernen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />;
}

function Btn({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded cursor-pointer transition-colors ${
        active
          ? "bg-asta-red text-white"
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
