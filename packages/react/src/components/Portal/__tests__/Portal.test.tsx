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

  it("does not render into the caller's tree", () => {
    const { container } = render(<Portal><div data-testid="child">hi</div></Portal>);
    expect(container.querySelector('[data-testid="child"]')).toBeNull();
  });

  it("unmounts portal children when parent unmounts", () => {
    const { unmount } = render(
      <Portal><div data-testid="transient">bye</div></Portal>,
    );
    expect(screen.getByTestId("transient")).toBeInTheDocument();
    unmount();
    expect(screen.queryByTestId("transient")).not.toBeInTheDocument();
  });

  it("falls back to document.body when container is null (via ?? coalescing)", () => {
    // A null container coalesces to document.body so consumers can pass a possibly-null ref.
    render(
      <Portal container={null}><div data-testid="null-fallback">x</div></Portal>,
    );
    expect(screen.getByTestId("null-fallback").parentElement).toBe(document.body);
  });
});
