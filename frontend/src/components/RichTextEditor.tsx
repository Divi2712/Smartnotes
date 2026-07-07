import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";

interface Props {
  content: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="editor-wrapper">

      <div className="toolbar">

        <button
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          B
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
        >
          I
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleUnderline().run()
          }
        >
          U
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHighlight().run()
          }
        >
          Highlight
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          • List
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          1. List
        </button>

        <button
          onClick={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
        >
          Left
        </button>

        <button
          onClick={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
        >
          Center
        </button>

        <button
          onClick={() =>
            editor.chain().focus().setTextAlign("right").run()
          }
        >
          Right
        </button>

      </div>

      <EditorContent
        editor={editor}
        className="editor-content"
      />

    </div>
  );
}