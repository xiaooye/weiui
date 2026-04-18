import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("has role=progressbar", () => {
    render(<ProgressBar />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow to value", () => {
    render(<ProgressBar value={42} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
  });

  it("sets aria-valuemin and aria-valuemax", () => {
    render(<ProgressBar value={50} max={200} />);
    const el = screen.getByRole("progressbar");
    expect(el).toHaveAttribute("aria-valuemin", "0");
    expect(el).toHaveAttribute("aria-valuemax", "200");
  });

  it("uses custom label as aria-label", () => {
    render(<ProgressBar label="Upload progress" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Upload progress");
  });

  it("defaults aria-label to Progress", () => {
    render(<ProgressBar />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Progress");
  });

  it("applies sm size class", () => {
    render(<ProgressBar size="sm" />);
    expect(screen.getByRole("progressbar").className).toContain("wui-progress--sm");
  });

  it("applies lg size class", () => {
    render(<ProgressBar size="lg" />);
    expect(screen.getByRole("progressbar").className).toContain("wui-progress--lg");
  });

  it("does not apply size class for md (default)", () => {
    render(<ProgressBar />);
    expect(screen.getByRole("progressbar").className).not.toContain("wui-progress--md");
  });

  it("applies success color class", () => {
    render(<ProgressBar color="success" />);
    expect(screen.getByRole("progressbar").className).toContain("wui-progress--success");
  });

  it("applies destructive color class", () => {
    render(<ProgressBar color="destructive" />);
    expect(screen.getByRole("progressbar").className).toContain("wui-progress--destructive");
  });

  it("applies warning color class", () => {
    render(<ProgressBar color="warning" />);
    expect(screen.getByRole("progressbar").className).toContain("wui-progress--warning");
  });

  it("does not apply primary color class (default)", () => {
    render(<ProgressBar />);
    expect(screen.getByRole("progressbar").className).not.toContain("wui-progress--primary");
  });

  it("indeterminate mode removes aria-valuenow", () => {
    render(<ProgressBar indeterminate />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });

  it("indeterminate mode applies indeterminate class", () => {
    render(<ProgressBar indeterminate />);
    expect(screen.getByRole("progressbar").className).toContain("wui-progress--indeterminate");
  });

  it("merges custom className", () => {
    render(<ProgressBar className="extra" />);
    expect(screen.getByRole("progressbar").className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ProgressBar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("uses wui-progress class (PRM-gated animations in CSS layer)", () => {
    // Both the fill transition and indeterminate animation are defined inside
    // @media (prefers-reduced-motion: no-preference) — see progress.css.
    render(<ProgressBar value={50} />);
    expect(screen.getByRole("progressbar")).toHaveClass("wui-progress");
  });

  // E.14 label overlay
  it("does not render label overlay by default", () => {
    render(<ProgressBar value={42} />);
    expect(screen.getByRole("progressbar").querySelector(".wui-progress__label")).not.toBeInTheDocument();
  });

  it("renders label overlay with percent when showLabel is true", () => {
    render(<ProgressBar value={42} showLabel />);
    expect(screen.getByRole("progressbar").querySelector(".wui-progress__label")).toHaveTextContent("42%");
  });

  it("rounds percent in the label", () => {
    render(<ProgressBar value={33} max={100} showLabel />);
    expect(screen.getByRole("progressbar").querySelector(".wui-progress__label")).toHaveTextContent("33%");
  });

  it("calculates percent from value/max for the label", () => {
    render(<ProgressBar value={50} max={200} showLabel />);
    expect(screen.getByRole("progressbar").querySelector(".wui-progress__label")).toHaveTextContent("25%");
  });

  it("label overlay is aria-hidden so SR reads value attributes", () => {
    render(<ProgressBar value={42} showLabel />);
    const lbl = screen.getByRole("progressbar").querySelector(".wui-progress__label") as HTMLElement;
    expect(lbl).toHaveAttribute("aria-hidden", "true");
  });

  it("does not render label overlay when indeterminate", () => {
    render(<ProgressBar indeterminate showLabel />);
    expect(screen.getByRole("progressbar").querySelector(".wui-progress__label")).not.toBeInTheDocument();
  });

  it("applies wui-progress--with-label class when showLabel is on", () => {
    render(<ProgressBar value={50} showLabel />);
    expect(screen.getByRole("progressbar").className).toContain("wui-progress--with-label");
  });
});
