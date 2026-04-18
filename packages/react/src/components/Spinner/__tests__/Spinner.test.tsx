import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../Spinner";

describe("Spinner", () => {
  it("has role=status", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has aria-label", () => {
    render(<Spinner label="Please wait" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Please wait");
  });

  it("renders sr-only label text", () => {
    render(<Spinner label="Loading data" />);
    expect(screen.getByText("Loading data")).toBeInTheDocument();
  });

  it("applies sm size style", () => {
    render(<Spinner size="sm" />);
    const el = screen.getByRole("status");
    expect(el).toHaveStyle({ width: "16px", height: "16px" });
  });

  it("applies lg size style", () => {
    render(<Spinner size="lg" />);
    const el = screen.getByRole("status");
    expect(el).toHaveStyle({ width: "32px", height: "32px" });
  });

  it("uses motion-safe wui-spinner class (PRM-gated animation)", () => {
    // Tailwind's animate-spin ignores prefers-reduced-motion. We use a custom
    // wui-spinner class that is PRM-gated in the CSS layer.
    render(<Spinner />);
    const el = screen.getByRole("status");
    expect(el).toHaveClass("wui-spinner");
    expect(el.className).not.toContain("animate-spin");
  });

  // E.13 color variant
  it("does not apply color class for default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").className).not.toContain("wui-spinner--default");
  });

  it("applies primary color class", () => {
    render(<Spinner color="primary" />);
    expect(screen.getByRole("status").className).toContain("wui-spinner--primary");
  });

  it("applies destructive color class", () => {
    render(<Spinner color="destructive" />);
    expect(screen.getByRole("status").className).toContain("wui-spinner--destructive");
  });

  it("applies success color class", () => {
    render(<Spinner color="success" />);
    expect(screen.getByRole("status").className).toContain("wui-spinner--success");
  });

  it("applies warning color class", () => {
    render(<Spinner color="warning" />);
    expect(screen.getByRole("status").className).toContain("wui-spinner--warning");
  });
});
