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

  // E.16 visible + width/height + count
  it("renders children when visible is false", () => {
    render(
      <Skeleton visible={false}>
        <span data-testid="content">Loaded</span>
      </Skeleton>,
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(document.querySelector(".wui-skeleton")).not.toBeInTheDocument();
  });

  it("renders the skeleton when visible is true (default)", () => {
    render(
      <Skeleton data-testid="skel">
        <span>Loaded</span>
      </Skeleton>,
    );
    expect(screen.getByTestId("skel")).toBeInTheDocument();
  });

  it("applies width and height as CSS lengths (number → px)", () => {
    render(<Skeleton width={120} height={24} data-testid="skel" />);
    const el = screen.getByTestId("skel");
    expect(el.style.inlineSize).toBe("120px");
    expect(el.style.blockSize).toBe("24px");
  });

  it("passes string width/height through unchanged", () => {
    render(<Skeleton width="50%" height="2rem" data-testid="skel" />);
    const el = screen.getByTestId("skel");
    expect(el.style.inlineSize).toBe("50%");
    expect(el.style.blockSize).toBe("2rem");
  });

  it("renders a single block by default", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelectorAll(".wui-skeleton").length).toBe(1);
  });

  it("renders N blocks when count is set", () => {
    const { container } = render(<Skeleton count={4} />);
    expect(container.querySelectorAll(".wui-skeleton").length).toBe(4);
  });

  it("applies width/height to each block when count > 1", () => {
    const { container } = render(<Skeleton count={3} width={100} height={10} />);
    const blocks = container.querySelectorAll(".wui-skeleton");
    expect(blocks.length).toBe(3);
    blocks.forEach((b) => {
      expect((b as HTMLElement).style.inlineSize).toBe("100px");
      expect((b as HTMLElement).style.blockSize).toBe("10px");
    });
  });
});
