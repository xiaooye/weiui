import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisuallyHidden } from "../VisuallyHidden";

describe("VisuallyHidden", () => {
  it("renders a span", () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(screen.getByText("Hidden text").tagName).toBe("SPAN");
  });

  it("applies wui-sr-only class", () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(screen.getByText("Hidden text").className).toContain("wui-sr-only");
  });

  it("merges custom className", () => {
    render(<VisuallyHidden className="extra">Hidden</VisuallyHidden>);
    const el = screen.getByText("Hidden");
    expect(el.className).toContain("wui-sr-only");
    expect(el.className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLSpanElement>;
    render(<VisuallyHidden ref={ref}>Text</VisuallyHidden>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
