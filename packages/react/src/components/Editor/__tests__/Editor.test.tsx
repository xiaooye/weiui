import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRef } from "react";
import { render, screen, act } from "@testing-library/react";
import { Editor, type EditorHandle } from "../Editor";

// Ensure a window.prompt stub exists for link insertion tests in jsdom.
beforeEach(() => {
  vi.stubGlobal("prompt", vi.fn(() => "https://example.com"));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Editor", () => {
  it("renders toolbar and content area", () => {
    render(<Editor defaultValue="<p>hello</p>" label="My editor" />);
    expect(screen.getByRole("group", { name: "My editor" })).toBeInTheDocument();
    // Two toolbars exist when bubble menu is enabled; main is always present.
    const toolbars = screen.getAllByRole("toolbar");
    expect(toolbars.length).toBeGreaterThanOrEqual(1);
  });

  // Wave 5d P0: Link insertion button present in toolbar
  it("renders a Link toolbar button", () => {
    render(<Editor defaultValue="<p>hello</p>" />);
    expect(screen.getByRole("button", { name: /link/i })).toBeInTheDocument();
  });

  // Wave 5d P0: extensions prop is accepted and merged with StarterKit
  it("accepts extensions prop without throwing", () => {
    // An empty extensions array should be accepted (merged with StarterKit).
    expect(() =>
      render(<Editor defaultValue="<p>hi</p>" extensions={[]} />),
    ).not.toThrow();
  });

  it("defaults aria-label to 'Rich text editor' when no label prop given", () => {
    render(<Editor defaultValue="<p>hello</p>" />);
    expect(screen.getByRole("group", { name: /rich text editor/i })).toBeInTheDocument();
  });

  it("applies wui-editor class and data-disabled when disabled", () => {
    render(<Editor defaultValue="<p>x</p>" disabled />);
    const group = screen.getByRole("group");
    expect(group).toHaveClass("wui-editor");
    expect(group).toHaveAttribute("data-disabled");
  });

  it("exposes the expected formatting toolbar buttons", () => {
    render(<Editor defaultValue="<p>x</p>" />);
    // A representative set of toolbar buttons that the Editor ships by default.
    const expected = [/bold/i, /italic/i, /strikethrough/i, /heading 1/i, /bullet list/i, /inline code/i];
    for (const name of expected) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("merges user className with wui-editor base class", () => {
    render(<Editor defaultValue="<p>x</p>" className="my-editor" />);
    const group = screen.getByRole("group");
    expect(group).toHaveClass("wui-editor");
    expect(group).toHaveClass("my-editor");
  });

  // P1 group G: toolbar buttons expose shortcut hints via title + aria-label
  it("includes keyboard shortcut hints in toolbar button title and aria-label", () => {
    render(<Editor defaultValue="<p>x</p>" />);
    const bold = screen.getByRole("button", { name: /bold \(ctrl\/cmd\+b\)/i });
    expect(bold).toHaveAttribute("title", expect.stringMatching(/Bold \(Ctrl\/Cmd\+B\)/));
  });

  // P1 group G: undo / redo toolbar buttons
  it("renders undo and redo buttons (disabled when no history)", () => {
    render(<Editor defaultValue="<p>x</p>" />);
    const undo = screen.getByRole("button", { name: /undo/i });
    const redo = screen.getByRole("button", { name: /redo/i });
    expect(undo).toBeDisabled();
    expect(redo).toBeDisabled();
  });

  // P1 group G: image toolbar button
  it("renders an image insert button", () => {
    render(<Editor defaultValue="<p>x</p>" />);
    expect(screen.getByRole("button", { name: /insert image/i })).toBeInTheDocument();
  });

  // P1 group G: onImageUpload causes image button to trigger the file picker
  it("with onImageUpload, inserts image via setImage after file is chosen", async () => {
    const onImageUpload = vi.fn(async () => "https://cdn.example.com/img.png");
    const ref = createRef<EditorHandle>();
    const { container } = render(
      <Editor ref={ref} defaultValue="<p>x</p>" onImageUpload={onImageUpload} />,
    );
    const fileInput = container.querySelector<HTMLInputElement>(
      "input.wui-editor__file-input",
    );
    expect(fileInput).not.toBeNull();
    const file = new File(["x"], "img.png", { type: "image/png" });
    await act(async () => {
      Object.defineProperty(fileInput!, "files", {
        value: [file],
        configurable: true,
      });
      fileInput!.dispatchEvent(new Event("change", { bubbles: true }));
      // Let the microtask queue flush.
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(onImageUpload).toHaveBeenCalledWith(file);
    expect(ref.current?.getHTML()).toMatch(/<img[^>]+src="https:\/\/cdn\.example\.com\/img\.png"/);
  });

  // P1 group G: without onImageUpload, falls back to window.prompt
  it("without onImageUpload, prompts for URL and inserts image", () => {
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "https://cdn.example.com/fallback.png"),
    );
    const ref = createRef<EditorHandle>();
    render(<Editor ref={ref} defaultValue="<p>x</p>" />);
    const imgBtn = screen.getByRole("button", { name: /insert image/i });
    act(() => {
      imgBtn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    });
    expect(ref.current?.getHTML()).toMatch(/<img[^>]+src="https:\/\/cdn\.example\.com\/fallback\.png"/);
  });

  // P1 group G: configurable toolbar via array
  it("renders only the toolbar items listed when toolbar is an array", () => {
    render(<Editor defaultValue="<p>x</p>" toolbar={["bold", "italic"]} />);
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /strikethrough/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /heading 1/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /insert image/i })).toBeNull();
  });

  // P1 group G: "minimal" preset
  it("renders only bold, italic, link when toolbar is 'minimal'", () => {
    render(<Editor defaultValue="<p>x</p>" toolbar="minimal" />);
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /link/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /heading 1/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /insert image/i })).toBeNull();
  });

  // P1 group G: character count rendering
  it("renders character and word count when showCount is true", () => {
    render(<Editor defaultValue="<p>hello world</p>" showCount />);
    const count = screen.getByTestId("editor-count");
    expect(count).toHaveAttribute("aria-live", "polite");
    // "hello world" = 11 chars, 2 words
    expect(count.textContent).toMatch(/11 characters/);
    expect(count.textContent).toMatch(/2 words/);
  });

  // P1 group G: count NOT rendered by default
  it("does not render character count by default", () => {
    render(<Editor defaultValue="<p>hello</p>" />);
    expect(screen.queryByTestId("editor-count")).toBeNull();
  });

  // P1 group G: bubble menu — BubbleMenu from @tiptap/react/menus portals its
  // children into a *detached* div that only gets attached by the ProseMirror
  // plugin when a non-empty selection exists. In jsdom, getBoundingClientRect
  // returns zeros and the plugin's visibility check typically stays hidden;
  // additionally, `document.querySelector` cannot find detached nodes. We
  // therefore smoke-test that (1) the prop is accepted without throwing, and
  // (2) a second plugin was registered on the editor.
  it("registers a bubble menu plugin when bubbleMenu is true", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor ref={ref} defaultValue="<p>hello</p>" bubbleMenu />);
    // Count plugins before/after by comparing to a baseline without bubbleMenu.
    const baseRef = createRef<EditorHandle>();
    render(<Editor ref={baseRef} defaultValue="<p>hello</p>" />);
    const bubblePluginCount = ref.current?.editor?.state.plugins.length ?? 0;
    const basePluginCount = baseRef.current?.editor?.state.plugins.length ?? 0;
    expect(bubblePluginCount).toBeGreaterThan(basePluginCount);
  });

  it("accepts bubbleMenu prop without throwing", () => {
    expect(() =>
      render(<Editor defaultValue="<p>hello</p>" bubbleMenu />),
    ).not.toThrow();
  });

  // P1 group G: markdown export via ref.getMarkdown
  it("exposes getMarkdown and getHTML on the forwarded ref", () => {
    const ref = createRef<EditorHandle>();
    render(<Editor ref={ref} defaultValue="<p><strong>hello</strong></p>" />);
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.getMarkdown).toBe("function");
    expect(typeof ref.current?.getHTML).toBe("function");
    expect(ref.current?.getHTML()).toMatch(/<strong>hello<\/strong>/);
    expect(ref.current?.getMarkdown()).toMatch(/\*\*hello\*\*/);
  });

  // P1 group G: onChangeMarkdown fires alongside onChange
  it("calls onChangeMarkdown with the markdown source on updates", () => {
    const onChange = vi.fn();
    const onChangeMarkdown = vi.fn();
    const ref = createRef<EditorHandle>();
    render(
      <Editor
        ref={ref}
        defaultValue="<p>x</p>"
        onChange={onChange}
        onChangeMarkdown={onChangeMarkdown}
      />,
    );
    act(() => {
      ref.current?.editor?.commands.setContent("<p><em>italic</em></p>");
    });
    expect(onChange).toHaveBeenCalled();
    expect(onChangeMarkdown).toHaveBeenCalled();
    const lastMd = onChangeMarkdown.mock.calls.at(-1)?.[0] as string;
    expect(lastMd).toMatch(/\*italic\*/);
  });

  // P1 group G: codeHighlighting=false still allows code blocks but without lowlight
  it("accepts codeHighlighting prop without crashing", () => {
    expect(() =>
      render(<Editor defaultValue="<p>x</p>" codeHighlighting={false} />),
    ).not.toThrow();
    expect(() =>
      render(<Editor defaultValue="<p>x</p>" codeHighlighting={true} />),
    ).not.toThrow();
  });

  // P1 group G (task 9): setContent loop guard — does NOT trigger onChange feedback loop
  it("controlled value prop does not cause an infinite onChange loop", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Editor value="<p>a</p>" onChange={onChange} />);
    onChange.mockClear();
    // Re-render with the SAME value — the guard should prevent setContent.
    rerender(<Editor value="<p>a</p>" onChange={onChange} />);
    rerender(<Editor value="<p>a</p>" onChange={onChange} />);
    rerender(<Editor value="<p>a</p>" onChange={onChange} />);
    // Guard should prevent redundant setContent, hence zero onChange from the loop.
    expect(onChange).not.toHaveBeenCalled();
  });

  it("controlled value prop updates editor content on real change (no loop)", () => {
    const onChange = vi.fn();
    const ref = createRef<EditorHandle>();
    const { rerender } = render(
      <Editor ref={ref} value="<p>a</p>" onChange={onChange} />,
    );
    rerender(<Editor ref={ref} value="<p>b</p>" onChange={onChange} />);
    expect(ref.current?.getHTML()).toMatch(/<p>b<\/p>/);
  });

  // Separator items render but aren't buttons
  it("renders separators in the default toolbar", () => {
    const { container } = render(<Editor defaultValue="<p>x</p>" />);
    const separators = container.querySelectorAll(".wui-editor__toolbar-sep");
    expect(separators.length).toBeGreaterThan(0);
  });
});
