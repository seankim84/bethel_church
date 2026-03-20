"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export function TiptapEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "내용을 입력하세요." })],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[180px] rounded-md border border-slate-300 p-3 text-sm outline-none"
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) editor.commands.setContent(value || "");
  }, [editor, value]);

  return <EditorContent editor={editor} />;
}
