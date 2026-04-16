import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stack } from "../Stack";

describe("Stack", () => {
  it("renders children", () => {
    render(<Stack>content</Stack>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies wui-stack class by default", () => {
    const { container } = render(<Stack>content</Stack>);
    expect(container.firstChild).toHaveClass("wui-stack");
  });

  it("applies row direction class", () => {
    const { container } = render(<Stack direction="row">content</Stack>);
    expect(container.firstChild).toHaveClass("wui-stack--row");
  });

  it("does not apply row class for column direction", () => {
    const { container } = render(<Stack direction="column">content</Stack>);
    expect(container.firstChild).not.toHaveClass("wui-stack--row");
  });

  it("applies wrap class when wrap is true", () => {
    const { container } = render(<Stack wrap>content</Stack>);
    expect(container.firstChild).toHaveClass("wui-stack--wrap");
  });

  it("applies gap via style", () => {
    const { container } = render(<Stack gap={4}>content</Stack>);
    expect(container.firstChild).toHaveStyle({ gap: "var(--wui-spacing-4)" });
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Stack ref={ref}>content</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
