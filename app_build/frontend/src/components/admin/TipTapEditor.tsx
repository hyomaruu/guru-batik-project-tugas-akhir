"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

const renderToolbarButton = (onClick: any, active: boolean, title: string, children: any) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active ? "bg-ink text-white" : "text-body hover:bg-canvas-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
};

export default function TipTapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Tulis konten artikel di sini..." }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "p-4 min-h-[320px] focus:outline-none text-sm text-body" },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div id="tiptap-wrapper">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-hairline bg-canvas-soft" id="tiptap-toolbar">
        {renderToolbarButton(
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive("bold"),
          "Bold",
          <strong>B</strong>
        )}
        {renderToolbarButton(
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive("italic"),
          "Italic",
          <em>I</em>
        )}
        {renderToolbarButton(
          () => editor.chain().focus().toggleStrike().run(),
          editor.isActive("strike"),
          "Strikethrough",
          <s>S</s>
        )}

        <div className="w-px h-5 bg-hairline mx-1" />

        {renderToolbarButton(
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive("heading", { level: 2 }),
          "Heading 2",
          "H2"
        )}
        {renderToolbarButton(
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          editor.isActive("heading", { level: 3 }),
          "Heading 3",
          "H3"
        )}

        <div className="w-px h-5 bg-hairline mx-1" />

        {renderToolbarButton(
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive("bulletList"),
          "Bullet List",
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        )}
        {renderToolbarButton(
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive("orderedList"),
          "Ordered List",
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )}
        {renderToolbarButton(
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive("blockquote"),
          "Blockquote",
          "\""
        )}

        <div className="w-px h-5 bg-hairline mx-1" />

        {renderToolbarButton(
          () => {
            const url = window.prompt("URL Link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          },
          editor.isActive("link"),
          "Insert Link",
          "🔗"
        )}
        {renderToolbarButton(
          () => editor.chain().focus().unsetLink().run(),
          false,
          "Remove Link",
          "🔗✕"
        )}

        <div className="w-px h-5 bg-hairline mx-1" />

        {renderToolbarButton(
          () => editor.chain().focus().undo().run(),
          false,
          "Undo",
          "↩"
        )}
        {renderToolbarButton(
          () => editor.chain().focus().redo().run(),
          false,
          "Redo",
          "↪"
        )}
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
