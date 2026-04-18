import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("handles click events", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("applies variant classes", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("wui-button--outline");
  });

  it("applies size classes", () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("wui-button--lg");
  });

  it("merges custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button").className).toContain("custom-class");
  });

  it("renders startIcon and endIcon", () => {
    render(
      <Button startIcon={<span data-testid="start">S</span>} endIcon={<span data-testid="end">E</span>}>
        Text
      </Button>,
    );
    expect(screen.getByTestId("start")).toBeInTheDocument();
    expect(screen.getByTestId("end")).toBeInTheDocument();
  });

  it("defaults type to 'button' to avoid form-submit surprises", () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("preserves an explicit type prop", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("renders a spinner inside loading state", () => {
    render(<Button loading>Loading</Button>);
    // The spinner is a status element providing feedback while the button is busy.
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("loading state hides startIcon but still shows label region", () => {
    render(
      <Button loading startIcon={<span data-testid="start">S</span>}>
        Hello
      </Button>,
    );
    expect(screen.queryByTestId("start")).not.toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild variant="outline">
        <a href="/home" data-testid="link">Home</a>
      </Button>,
    );
    const link = screen.getByTestId("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/home");
    expect(link.className).toContain("wui-button");
    expect(link.className).toContain("wui-button--outline");
  });

  it("asChild preserves child's own className", () => {
    render(
      <Button asChild>
        <a href="/home" className="my-link">Home</a>
      </Button>,
    );
    const link = screen.getByText("Home");
    expect(link.className).toContain("wui-button");
    expect(link.className).toContain("my-link");
  });

  it("iconOnly adds icon size class", () => {
    render(
      <Button iconOnly aria-label="close">
        <span>x</span>
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "close" });
    expect(btn.className).toContain("wui-button--icon-only");
  });

  it("fullWidth adds full-width class", () => {
    render(<Button fullWidth>Submit</Button>);
    expect(screen.getByRole("button").className).toContain("wui-button--full-width");
  });
});
