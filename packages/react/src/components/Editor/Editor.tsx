"use client";
import { forwardRef, useEffect, type ReactNode } from "react";
import { useEditor, EditorContent, type Editor as TipTapEditor, type Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "../../utils/cn";

export interface EditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  /** Additional Tiptap extensions to merge with StarterKit + Placeholder. */
  extensions?: Extensions;
}

interface ToolbarBtnProps {
  editor: TipTapEditor;
  action: () => boolean | void;
  isActive?: boolean;
  label: string;
  children: ReactNode;
}

function ToolbarBtn({ action, isActive, label, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      className="wui-editor__toolbar-btn"
      data-active={isActive || undefined}
      aria-label={label}
      aria-pressed={isActive}
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
    >
      {children}
    </button>
  );
}

export const Editor = forwardRef<HTMLDivElement, EditorProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = "Write something...",
      disabled,
      className,
      label,
      extensions,
    },
    ref,
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder }),
        ...(extensions ?? []),
      ],
      content: value ?? defaultValue ?? "",
      editable: !disabled,
      onUpdate: ({ editor: e }) => {
        onChange?.(e.getHTML());
      },
    });

    useEffect(() => {
      if (editor && value !== undefined && editor.getHTML() !== value) {
        editor.commands.setContent(value);
      }
    }, [editor, value]);

    useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled);
      }
    }, [editor, disabled]);

    if (!editor) return null;

    const handleInsertLink = () => {
      const current = editor.getAttributes("link").href as string | undefined;
      const url = typeof window !== "undefined" ? window.prompt("Enter URL", current ?? "https://") : null;
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
      <div
        ref={ref}
        className={cn("wui-editor", className)}
        data-disabled={disabled || undefined}
        role="group"
        aria-label={label || "Rich text editor"}
      >
        <div className="wui-editor__toolbar" role="toolbar" aria-label="Formatting options">
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} label="Bold">
            <strong>B</strong>
          </ToolbarBtn>
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} label="Italic">
            <em>I</em>
          </ToolbarBtn>
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} label="Strikethrough">
            <s>S</s>
          </ToolbarBtn>
          <div className="wui-editor__toolbar-sep" aria-hidden="true" />
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} label="Heading 1">
            H1
          </ToolbarBtn>
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} label="Heading 2">
            H2
          </ToolbarBtn>
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} label="Heading 3">
            H3
          </ToolbarBtn>
          <div className="wui-editor__toolbar-sep" aria-hidden="true" />
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} label="Bullet list">
            &bull;
          </ToolbarBtn>
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} label="Numbered list">
            1.
          </ToolbarBtn>
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} label="Blockquote">
            &ldquo;
          </ToolbarBtn>
          <div className="wui-editor__toolbar-sep" aria-hidden="true" />
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} label="Inline code">
            {"</>"}
          </ToolbarBtn>
          <ToolbarBtn editor={editor} action={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} label="Code block">
            {"{ }"}
          </ToolbarBtn>
          <ToolbarBtn editor={editor} action={handleInsertLink} isActive={editor.isActive("link")} label="Link">
            <span aria-hidden="true">&#128279;</span>
          </ToolbarBtn>
        </div>
        <div className="wui-editor__content">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
);
Editor.displayName = "Editor";
