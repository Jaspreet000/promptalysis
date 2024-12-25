import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert focus:outline-none max-w-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md">
      <div className="border-b p-2 flex space-x-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded ${
            editor.isActive("bold") ? "bg-gray-200" : ""
          }`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded ${
            editor.isActive("italic") ? "bg-gray-200" : ""
          }`}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
        >
          List
        </button>
      </div>
      <EditorContent editor={editor} className="p-4" />
    </div>
  );
};

export default RichTextEditor;
