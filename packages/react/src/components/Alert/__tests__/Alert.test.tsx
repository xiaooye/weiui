import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "../Alert";

describe("Alert", () => {
  it("has role=alert", () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders title and description", () => {
    render(
      <Alert>
        <AlertTitle>Title text</AlertTitle>
        <AlertDescription>Description text</AlertDescription>
      </Alert>,
    );
    expect(screen.getByText("Title text")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("applies variant class for destructive", () => {
    render(<Alert variant="destructive">Error</Alert>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("border-[var(--wui-color-destructive)]");
  });

  it("applies variant class for success", () => {
    render(<Alert variant="success">Success</Alert>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("border-[var(--wui-color-success)]");
  });

  it("applies variant class for warning", () => {
    render(<Alert variant="warning">Warning</Alert>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("border-[var(--wui-color-warning)]");
  });

  it("default variant is info", () => {
    render(<Alert>Info</Alert>);
    const el = screen.getByRole("alert");
    expect(el.className).toContain("border-[var(--wui-color-primary)]");
  });
});
