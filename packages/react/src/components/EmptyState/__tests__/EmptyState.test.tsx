import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No results found" />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("renders optional description", () => {
    render(<EmptyState title="Empty" description="Try adjusting your filters." />);
    expect(screen.getByText("Try adjusting your filters.")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText(/adjusting/)).not.toBeInTheDocument();
  });

  it("renders optional icon", () => {
    render(<EmptyState title="Empty" icon={<span data-testid="icon">📭</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("does not render icon wrapper when icon is omitted", () => {
    const { container } = render(<EmptyState title="Empty" />);
    // Only the root div and h3 should be present (no extra wrapper div for icon)
    expect(container.querySelector("[data-testid='icon']")).not.toBeInTheDocument();
  });

  it("renders optional action", () => {
    render(<EmptyState title="Empty" action={<button>Retry</button>} />);
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  // E.15 size + illustration + orientation
  it("does not apply size class for default md", () => {
    const { container } = render(<EmptyState title="x" />);
    expect((container.firstChild as HTMLElement).className).not.toContain("wui-empty-state--md");
  });

  it("applies sm size class", () => {
    const { container } = render(<EmptyState title="x" size="sm" />);
    expect((container.firstChild as HTMLElement).className).toContain("wui-empty-state--sm");
  });

  it("applies lg size class", () => {
    const { container } = render(<EmptyState title="x" size="lg" />);
    expect((container.firstChild as HTMLElement).className).toContain("wui-empty-state--lg");
  });

  it("renders illustration slot", () => {
    render(
      <EmptyState title="x" illustration={<svg data-testid="illust" />} />,
    );
    expect(screen.getByTestId("illust")).toBeInTheDocument();
  });

  it("does not render illustration wrapper when omitted", () => {
    const { container } = render(<EmptyState title="x" />);
    expect(container.querySelector(".wui-empty-state__illustration")).not.toBeInTheDocument();
  });

  it("applies horizontal orientation class", () => {
    const { container } = render(
      <EmptyState title="x" orientation="horizontal" />,
    );
    expect((container.firstChild as HTMLElement).className).toContain("wui-empty-state--horizontal");
  });

  it("does not apply horizontal class for default vertical", () => {
    const { container } = render(<EmptyState title="x" />);
    expect((container.firstChild as HTMLElement).className).not.toContain("wui-empty-state--horizontal");
  });
});
