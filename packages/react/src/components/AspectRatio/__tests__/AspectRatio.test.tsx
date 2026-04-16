import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AspectRatio } from "../AspectRatio";

describe("AspectRatio", () => {
  it("renders children", () => {
    render(<AspectRatio>content</AspectRatio>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies wui-aspect-ratio class", () => {
    const { container } = render(<AspectRatio>content</AspectRatio>);
    expect(container.firstChild).toHaveClass("wui-aspect-ratio");
  });

  it("applies default 16/9 aspect ratio via style", () => {
    const { container } = render(<AspectRatio>content</AspectRatio>);
    expect(container.firstChild).toHaveStyle({ aspectRatio: `${16 / 9}` });
  });

  it("applies custom ratio via style", () => {
    const { container } = render(<AspectRatio ratio={4 / 3}>content</AspectRatio>);
    expect(container.firstChild).toHaveStyle({ aspectRatio: `${4 / 3}` });
  });

  it("merges custom className", () => {
    const { container } = render(<AspectRatio className="custom">content</AspectRatio>);
    expect(container.firstChild).toHaveClass("wui-aspect-ratio", "custom");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<AspectRatio ref={ref}>content</AspectRatio>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
