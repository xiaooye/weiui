import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("renders a div", () => {
    render(<Skeleton data-testid="skel" />);
    expect(screen.getByTestId("skel").tagName).toBe("DIV");
  });

  it("has aria-hidden set to true", () => {
    render(<Skeleton data-testid="skel" />);
    expect(screen.getByTestId("skel")).toHaveAttribute("aria-hidden", "true");
  });

  it("applies wui-skeleton class", () => {
    render(<Skeleton data-testid="skel" />);
    expect(screen.getByTestId("skel").className).toContain("wui-skeleton");
  });

  it("does not apply variant class for default rect", () => {
    render(<Skeleton data-testid="skel" />);
    const cls = screen.getByTestId("skel").className;
    expect(cls).not.toContain("wui-skeleton--text");
    expect(cls).not.toContain("wui-skeleton--circle");
  });

  it("applies wui-skeleton--text class for text variant", () => {
    render(<Skeleton variant="text" data-testid="skel" />);
    expect(screen.getByTestId("skel").className).toContain("wui-skeleton--text");
  });

  it("applies wui-skeleton--circle class for circle variant", () => {
    render(<Skeleton variant="circle" data-testid="skel" />);
    expect(screen.getByTestId("skel").className).toContain("wui-skeleton--circle");
  });

  it("merges custom className", () => {
    render(<Skeleton className="extra" data-testid="skel" />);
    expect(screen.getByTestId("skel").className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("uses wui-skeleton class whose shimmer is PRM-gated in the CSS layer", () => {
    // The shimmer ::after animation is defined inside
    // @media (prefers-reduced-motion: no-preference) — see skeleton.css.
    render(<Skeleton data-testid="skel" />);
    expect(screen.getByTestId("skel")).toHaveClass("wui-skeleton");
  });
});
