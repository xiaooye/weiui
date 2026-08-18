import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Stack } from "../Stack";

describe("Stack", () => {
  it("renders children", () => {
    render(<Stack>content</Stack>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies civ-stack class by default", () => {
    const { container } = render(<Stack>content</Stack>);
    expect(container.firstChild).toHaveClass("civ-stack");
  });

  it("applies row direction class", () => {
    const { container } = render(<Stack direction="row">content</Stack>);
    expect(container.firstChild).toHaveClass("civ-stack--row");
  });

  it("does not apply row class for column direction", () => {
    const { container } = render(<Stack direction="column">content</Stack>);
    expect(container.firstChild).not.toHaveClass("civ-stack--row");
  });

  it("applies wrap class when wrap is true", () => {
    const { container } = render(<Stack wrap>content</Stack>);
    expect(container.firstChild).toHaveClass("civ-stack--wrap");
  });

  it("applies gap via style", () => {
    const { container } = render(<Stack gap={4}>content</Stack>);
    expect(container.firstChild).toHaveStyle({ gap: "var(--civ-spacing-4)" });
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Stack ref={ref}>content</Stack>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
