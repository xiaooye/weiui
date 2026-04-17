import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Portal } from "../Portal";

describe("Portal", () => {
  it("renders children to document.body by default after mount", () => {
    render(<Portal><div data-testid="portal-child">hi</div></Portal>);
    const child = screen.getByTestId("portal-child");
    expect(child).toBeInTheDocument();
    expect(child.parentElement).toBe(document.body);
  });

  it("renders to custom container when provided", () => {
    const container = document.createElement("div");
    container.id = "custom";
    document.body.appendChild(container);
    render(<Portal container={container}><span data-testid="custom-portal">hi</span></Portal>);
    expect(screen.getByTestId("custom-portal").parentElement).toBe(container);
    document.body.removeChild(container);
  });
});
