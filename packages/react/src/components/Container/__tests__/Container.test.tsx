import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "../Container";

describe("Container", () => {
  it("renders children", () => {
    render(<Container>content</Container>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies wui-container class", () => {
    const { container } = render(<Container>content</Container>);
    expect(container.firstChild).toHaveClass("wui-container");
  });

  it("merges custom className", () => {
    const { container } = render(<Container className="custom">content</Container>);
    expect(container.firstChild).toHaveClass("wui-container", "custom");
  });

  it("applies custom maxWidth via style", () => {
    const { container } = render(<Container maxWidth="800px">content</Container>);
    expect(container.firstChild).toHaveStyle({ maxInlineSize: "800px" });
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Container ref={ref}>content</Container>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
