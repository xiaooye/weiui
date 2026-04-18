import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Editor } from "../Editor";

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
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
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
});
