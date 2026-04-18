import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "../Label";

describe("Label", () => {
  it("renders a label element", () => {
    render(<Label>Name</Label>);
    expect(screen.getByText("Name").tagName).toBe("LABEL");
  });

  it("does not show required indicator by default", () => {
    render(<Label>Name</Label>);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("shows required indicator when required is true", () => {
    render(<Label required>Name</Label>);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("required indicator is aria-hidden", () => {
    render(<Label required>Name</Label>);
    const asterisk = screen.getByText("*");
    expect(asterisk).toHaveAttribute("aria-hidden", "true");
  });

  it("passes htmlFor to the label", () => {
    render(<Label htmlFor="my-input">Name</Label>);
    expect(screen.getByText("Name").closest("label")).toHaveAttribute("for", "my-input");
  });

  it("merges custom className", () => {
    render(<Label className="custom">Name</Label>);
    expect(screen.getByText("Name").closest("label")).toHaveClass("custom");
  });

  // E.17 size + disabled
  it("does not apply size class for default md", () => {
    render(<Label>Name</Label>);
    expect(screen.getByText("Name").closest("label")?.className).not.toContain("wui-label--md");
  });

  it("applies sm size class", () => {
    render(<Label size="sm">Name</Label>);
    expect(screen.getByText("Name").closest("label")?.className).toContain("wui-label--sm");
  });

  it("applies lg size class", () => {
    render(<Label size="lg">Name</Label>);
    expect(screen.getByText("Name").closest("label")?.className).toContain("wui-label--lg");
  });

  it("applies disabled class and data-disabled when disabled", () => {
    render(<Label disabled>Name</Label>);
    const el = screen.getByText("Name").closest("label") as HTMLLabelElement;
    expect(el.className).toContain("wui-label--disabled");
    expect(el).toHaveAttribute("data-disabled");
  });

  it("does not set data-disabled when not disabled", () => {
    render(<Label>Name</Label>);
    const el = screen.getByText("Name").closest("label") as HTMLLabelElement;
    expect(el).not.toHaveAttribute("data-disabled");
  });
});
