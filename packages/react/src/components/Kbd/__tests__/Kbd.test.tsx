import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Kbd } from "../Kbd";

describe("Kbd", () => {
  it("renders a <kbd> element", () => {
    render(<Kbd>Ctrl</Kbd>);
    expect(screen.getByText("Ctrl").tagName).toBe("KBD");
  });

  it("applies font-mono class", () => {
    render(<Kbd>Ctrl</Kbd>);
    expect(screen.getByText("Ctrl").className).toContain("font-mono");
  });

  it("merges custom className", () => {
    render(<Kbd className="extra">Ctrl</Kbd>);
    expect(screen.getByText("Ctrl").className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLElement>();
    render(<Kbd ref={ref}>Ctrl</Kbd>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
