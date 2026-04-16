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
});
