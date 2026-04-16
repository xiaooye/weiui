import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Text } from "../Text";

describe("Text", () => {
  it("renders as p by default", () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText("Hello").tagName).toBe("P");
  });

  it("renders as span with as='span'", () => {
    render(<Text as="span">Hello</Text>);
    expect(screen.getByText("Hello").tagName).toBe("SPAN");
  });

  it("renders as div with as='div'", () => {
    render(<Text as="div">Hello</Text>);
    expect(screen.getByText("Hello").tagName).toBe("DIV");
  });

  it("applies text-sm for size='sm'", () => {
    render(<Text size="sm">Small</Text>);
    expect(screen.getByText("Small").className).toContain("text-sm");
  });

  it("applies text-xl for size='xl'", () => {
    render(<Text size="xl">XL</Text>);
    expect(screen.getByText("XL").className).toContain("text-xl");
  });

  it("applies muted color class", () => {
    render(<Text color="muted">Muted</Text>);
    expect(screen.getByText("Muted").className).toContain("--wui-color-muted-foreground");
  });

  it("applies primary color class", () => {
    render(<Text color="primary">Primary</Text>);
    expect(screen.getByText("Primary").className).toContain("--wui-color-primary");
  });

  it("applies destructive color class", () => {
    render(<Text color="destructive">Error</Text>);
    expect(screen.getByText("Error").className).toContain("--wui-color-destructive");
  });

  it("applies success color class", () => {
    render(<Text color="success">OK</Text>);
    expect(screen.getByText("OK").className).toContain("--wui-color-success");
  });

  it("applies weight class when specified", () => {
    render(<Text weight="bold">Bold</Text>);
    expect(screen.getByText("Bold").className).toContain("font-bold");
  });

  it("merges custom className", () => {
    render(<Text className="custom">Custom</Text>);
    expect(screen.getByText("Custom").className).toContain("custom");
  });
});
