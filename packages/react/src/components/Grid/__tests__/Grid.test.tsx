import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Grid } from "../Grid";

describe("Grid", () => {
  it("renders children", () => {
    render(<Grid>content</Grid>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("applies wui-grid class", () => {
    const { container } = render(<Grid>content</Grid>);
    expect(container.firstChild).toHaveClass("wui-grid");
  });

  it("applies numeric columns as repeat(n, 1fr)", () => {
    const { container } = render(<Grid columns={3}>content</Grid>);
    expect(container.firstChild).toHaveStyle({ gridTemplateColumns: "repeat(3, 1fr)" });
  });

  it("applies string columns directly", () => {
    const { container } = render(<Grid columns="1fr 2fr">content</Grid>);
    expect(container.firstChild).toHaveStyle({ gridTemplateColumns: "1fr 2fr" });
  });

  it("applies gap via style", () => {
    const { container } = render(<Grid gap={4}>content</Grid>);
    expect(container.firstChild).toHaveStyle({ gap: "var(--wui-spacing-4)" });
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Grid ref={ref}>content</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
