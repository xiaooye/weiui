import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Code } from "../Code";

describe("Code (inline)", () => {
  it("renders a <code> element by default", () => {
    render(<Code>const x = 1;</Code>);
    expect(screen.getByText("const x = 1;").tagName).toBe("CODE");
  });

  it("applies font-mono class inline", () => {
    render(<Code>const x = 1;</Code>);
    expect(screen.getByText("const x = 1;").className).toContain("font-mono");
  });

  it("merges custom className inline", () => {
    render(<Code className="extra">code</Code>);
    expect(screen.getByText("code").className).toContain("extra");
  });

  it("forwards ref inline", () => {
    const ref = { current: null } as React.RefObject<HTMLElement>;
    render(<Code ref={ref}>code</Code>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe("Code (block)", () => {
  it("renders a <pre> wrapping a <code> element", () => {
    render(<Code inline={false}>const x = 1;</Code>);
    const code = screen.getByText("const x = 1;");
    expect(code.tagName).toBe("CODE");
    expect(code.parentElement?.tagName).toBe("PRE");
  });

  it("applies font-mono class on the pre element", () => {
    render(<Code inline={false}>code</Code>);
    const code = screen.getByText("code");
    expect(code.parentElement?.className).toContain("font-mono");
  });

  it("forwards ref to the inner <code> when block", () => {
    const ref = { current: null } as React.RefObject<HTMLElement>;
    render(<Code inline={false} ref={ref}>code</Code>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect((ref.current as HTMLElement).tagName).toBe("CODE");
  });
});
