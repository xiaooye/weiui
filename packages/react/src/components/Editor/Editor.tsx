"use client";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useEditor,
  EditorContent,
  type Editor as TipTapEditor,
  type Extensions,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { Markdown } from "tiptap-markdown";
import { cn } from "../../utils/cn";

export type ToolbarItem =
  | "bold"
  | "italic"
  | "strike"
  | "h1"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "code"
  | "codeBlock"
  | "link"
  | "image"
  | "undo"
  | "redo"
  | "separator";

const DEFAULT_TOOLBAR: ToolbarItem[] = [
  "bold",
  "italic",
  "strike",
  "separator",
  "h1",
  "h2",
  "h3",
  "separator",
  "bulletList",
  "orderedList",
  "blockquote",
  "separator",
  "code",
  "codeBlock",
  "link",
  "image",
  "separator",
  "undo",
  "redo",
];

const MINIMAL_TOOLBAR: ToolbarItem[] = ["bold", "italic", "link"];

export interface EditorHandle {
  /** The underlying Tiptap editor instance (null until mounted). */
  editor: TipTapEditor | null;
  /** Serialize the current document to markdown. */
  getMarkdown: () => string;
  /** Serialize the current document to HTML. */
  getHTML: () => string;
}

export interface EditorProps {
  /** Controlled HTML content. Pair with `onChange`. */
  value?: string;
  /** Uncontrolled initial HTML content. */
  defaultValue?: string;
  /** Called when the document changes with the serialized HTML. */
  onChange?: (html: string) => void;
  /** Called when the document changes with the serialized markdown. */
  onChangeMarkdown?: (markdown: string) => void;
  /** Text shown when the editor is empty. */
  placeholder?: string;
  /** Disables editing and dims the editor. */
  disabled?: boolean;
  /** Additional CSS classes merged onto the editor root. */
  className?: string;
  /** Accessible label for the editor surface. */
  label?: string;
  /** Additional Tiptap extensions to merge with the built-ins. */
  extensions?: Extensions;
  /** Toolbar configuration: item list, `"default"`, or `"minimal"`. */
  toolbar?: ToolbarItem[] | "default" | "minimal";
  /** When provided, the image toolbar button opens a file picker and calls this. Must resolve with a URL. */
  onImageUpload?: (file: File) => Promise<string>;
  /** Show a floating toolbar above selected text. */
  bubbleMenu?: boolean;
  /** Syntax-highlight code blocks with lowlight. Defaults to `true`. */
  codeHighlighting?: boolean;
  /** Show character / word count below the editor. */
  showCount?: boolean;
}

interface ToolbarBtnProps {
  action: () => boolean | void;
  isActive?: boolean;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  children: ReactNode;
}

function ToolbarBtn({
  action,
  isActive,
  label,
  shortcut,
  disabled,
  children,
}: ToolbarBtnProps) {
  const fullLabel = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button
      type="button"
      className="wui-editor__toolbar-btn"
      data-active={isActive || undefined}
      aria-label={fullLabel}
      aria-pressed={isActive}
      title={fullLabel}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) action();
      }}
    >
      {children}
    </button>
  );
}

// Shared lowlight instance across all Editor mounts (safe — lowlight is stateless).
const lowlightInstance = createLowlight(common);

// tiptap-markdown attaches a `markdown` storage entry with a `getMarkdown`
// function, but does not augment Tiptap's Storage type. Narrow it locally.
interface MarkdownStorageShape {
  getMarkdown: () => string;
}
function getMarkdownStorage(e: TipTapEditor): MarkdownStorageShape | undefined {
  const storage = e.storage as unknown as Record<string, unknown>;
  const md = storage.markdown as MarkdownStorageShape | undefined;
  return md && typeof md.getMarkdown === "function" ? md : undefined;
}

function resolveToolbar(
  toolbar: ToolbarItem[] | "default" | "minimal" | undefined,
): ToolbarItem[] {
  if (toolbar === undefined || toolbar === "default") return DEFAULT_TOOLBAR;
  if (toolbar === "minimal") return MINIMAL_TOOLBAR;
  return toolbar;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onChangeMarkdown,
      placeholder = "Write something...",
      disabled,
      className,
      label,
      extensions,
      toolbar,
      onImageUpload,
      bubbleMenu = false,
      codeHighlighting = true,
      showCount = false,
    },
    ref,
  ) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [, forceRender] = useState(0);

    const builtInExtensions = useMemo(() => {
      const base = codeHighlighting
        ? [
            StarterKit.configure({ codeBlock: false }),
            CodeBlockLowlight.configure({ lowlight: lowlightInstance }),
          ]
        : [StarterKit];
      return [
        ...base,
        Placeholder.configure({ placeholder }),
        Image,
        Markdown.configure({ html: true, transformPastedText: false }),
        ...(showCount ? [CharacterCount.configure({})] : []),
      ];
    }, [codeHighlighting, placeholder, showCount]);

    const editor = useEditor({
      extensions: [...builtInExtensions, ...(extensions ?? [])],
      content: value ?? defaultValue ?? "",
      editable: !disabled,
      onUpdate: ({ editor: e }) => {
        onChange?.(e.getHTML());
        if (onChangeMarkdown) {
          onChangeMarkdown(getMarkdownStorage(e)?.getMarkdown() ?? "");
        }
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

    // Force re-render on selection / state change so toolbar active states update.
    useEffect(() => {
      if (!editor) return;
      const update = () => forceRender((n) => n + 1);
      editor.on("selectionUpdate", update);
      editor.on("transaction", update);
      return () => {
        editor.off("selectionUpdate", update);
        editor.off("transaction", update);
      };
    }, [editor]);

    useImperativeHandle(
      ref,
      () => ({
        editor,
        getMarkdown: () =>
          editor ? (getMarkdownStorage(editor)?.getMarkdown() ?? "") : "",
        getHTML: () => editor?.getHTML() ?? "",
      }),
      [editor],
    );

    if (!editor) return null;

    const handleInsertLink = () => {
      const current = editor.getAttributes("link").href as string | undefined;
      const url =
        typeof window !== "undefined"
          ? window.prompt("Enter URL", current ?? "https://")
          : null;
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    };

    const handleInsertImage = () => {
      if (onImageUpload) {
        fileInputRef.current?.click();
        return;
      }
      const url =
        typeof window !== "undefined"
          ? window.prompt("Enter image URL", "https://")
          : null;
      if (!url) return;
      editor.chain().focus().setImage({ src: url }).run();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageUpload) return;
      try {
        const url = await onImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } finally {
        // Reset so the same file can be re-selected.
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    const items = resolveToolbar(toolbar);
    const chars = showCount
      ? (editor.storage.characterCount?.characters?.() ?? 0)
      : 0;
    const words = showCount ? (editor.storage.characterCount?.words?.() ?? 0) : 0;

    const renderToolbarItem = (item: ToolbarItem, idx: number): ReactNode => {
      switch (item) {
        case "separator":
          return (
            <div
              key={`sep-${idx}`}
              className="wui-editor__toolbar-sep"
              aria-hidden="true"
            />
          );
        case "bold":
          return (
            <ToolbarBtn
              key="bold"
              action={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              label="Bold"
              shortcut="Ctrl/Cmd+B"
            >
              <strong>B</strong>
            </ToolbarBtn>
          );
        case "italic":
          return (
            <ToolbarBtn
              key="italic"
              action={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              label="Italic"
              shortcut="Ctrl/Cmd+I"
            >
              <em>I</em>
            </ToolbarBtn>
          );
        case "strike":
          return (
            <ToolbarBtn
              key="strike"
              action={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              label="Strikethrough"
              shortcut="Ctrl/Cmd+Shift+X"
            >
              <s>S</s>
            </ToolbarBtn>
          );
        case "h1":
          return (
            <ToolbarBtn
              key="h1"
              action={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
              label="Heading 1"
              shortcut="Ctrl/Cmd+Alt+1"
            >
              H1
            </ToolbarBtn>
          );
        case "h2":
          return (
            <ToolbarBtn
              key="h2"
              action={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
              label="Heading 2"
              shortcut="Ctrl/Cmd+Alt+2"
            >
              H2
            </ToolbarBtn>
          );
        case "h3":
          return (
            <ToolbarBtn
              key="h3"
              action={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={editor.isActive("heading", { level: 3 })}
              label="Heading 3"
              shortcut="Ctrl/Cmd+Alt+3"
            >
              H3
            </ToolbarBtn>
          );
        case "bulletList":
          return (
            <ToolbarBtn
              key="bulletList"
              action={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              label="Bullet list"
              shortcut="Ctrl/Cmd+Shift+8"
            >
              &bull;
            </ToolbarBtn>
          );
        case "orderedList":
          return (
            <ToolbarBtn
              key="orderedList"
              action={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              label="Numbered list"
              shortcut="Ctrl/Cmd+Shift+7"
            >
              1.
            </ToolbarBtn>
          );
        case "blockquote":
          return (
            <ToolbarBtn
              key="blockquote"
              action={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              label="Blockquote"
              shortcut="Ctrl/Cmd+Shift+B"
            >
              &ldquo;
            </ToolbarBtn>
          );
        case "code":
          return (
            <ToolbarBtn
              key="code"
              action={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              label="Inline code"
              shortcut="Ctrl/Cmd+E"
            >
              {"</>"}
            </ToolbarBtn>
          );
        case "codeBlock":
          return (
            <ToolbarBtn
              key="codeBlock"
              action={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              label="Code block"
              shortcut="Ctrl/Cmd+Alt+C"
            >
              {"{ }"}
            </ToolbarBtn>
          );
        case "link":
          return (
            <ToolbarBtn
              key="link"
              action={handleInsertLink}
              isActive={editor.isActive("link")}
              label="Link"
              shortcut="Ctrl/Cmd+K"
            >
              <span aria-hidden="true">&#128279;</span>
            </ToolbarBtn>
          );
        case "image":
          return (
            <ToolbarBtn
              key="image"
              action={handleInsertImage}
              label="Insert image"
            >
              <span aria-hidden="true">&#128247;</span>
            </ToolbarBtn>
          );
        case "undo":
          return (
            <ToolbarBtn
              key="undo"
              action={() => editor.chain().focus().undo().run()}
              label="Undo"
              shortcut="Ctrl/Cmd+Z"
              disabled={!editor.can().undo()}
            >
              <span aria-hidden="true">&#8630;</span>
            </ToolbarBtn>
          );
        case "redo":
          return (
            <ToolbarBtn
              key="redo"
              action={() => editor.chain().focus().redo().run()}
              label="Redo"
              shortcut="Ctrl/Cmd+Shift+Z"
              disabled={!editor.can().redo()}
            >
              <span aria-hidden="true">&#8631;</span>
            </ToolbarBtn>
          );
        default:
          return null;
      }
    };

    return (
      <div
        ref={rootRef}
        className={cn("wui-editor", className)}
        data-disabled={disabled || undefined}
        role="group"
        aria-label={label || "Rich text editor"}
      >
        <div
          className="wui-editor__toolbar"
          role="toolbar"
          aria-label="Formatting options"
        >
          {items.map((item, idx) => renderToolbarItem(item, idx))}
        </div>
        {onImageUpload ? (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="wui-editor__file-input"
            aria-hidden="true"
            tabIndex={-1}
            onChange={handleFileChange}
          />
        ) : null}
        <div className="wui-editor__content">
          <EditorContent editor={editor} />
        </div>
        {bubbleMenu ? (
          <BubbleMenu
            editor={editor}
            className="wui-editor__bubble"
            options={{ placement: "top" }}
          >
            <div
              className="wui-editor__bubble-inner"
              role="toolbar"
              aria-label="Selection formatting"
            >
              <ToolbarBtn
                action={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                label="Bold"
                shortcut="Ctrl/Cmd+B"
              >
                <strong>B</strong>
              </ToolbarBtn>
              <ToolbarBtn
                action={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                label="Italic"
                shortcut="Ctrl/Cmd+I"
              >
                <em>I</em>
              </ToolbarBtn>
              <ToolbarBtn
                action={handleInsertLink}
                isActive={editor.isActive("link")}
                label="Link"
                shortcut="Ctrl/Cmd+K"
              >
                <span aria-hidden="true">&#128279;</span>
              </ToolbarBtn>
            </div>
          </BubbleMenu>
        ) : null}
        {showCount ? (
          <div
            className="wui-editor__count"
            aria-live="polite"
            data-testid="editor-count"
          >
            {chars} characters &middot; {words} words
          </div>
        ) : null}
      </div>
    );
  },
);
Editor.displayName = "Editor";
