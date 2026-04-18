import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardContent, CardFooter } from "../Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card body</Card>);
    expect(screen.getByText("Card body")).toBeInTheDocument();
  });

  it("applies wui-card class", () => {
    render(<Card>content</Card>);
    expect(screen.getByText("content").className).toContain("wui-card");
  });

  it("merges custom className", () => {
    render(<Card className="custom">content</Card>);
    expect(screen.getByText("content").className).toContain("custom");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("CardHeader", () => {
  it("renders with wui-card__header class", () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    const el = screen.getByTestId("header");
    expect(el.className).toContain("wui-card__header");
  });

  it("merges custom className", () => {
    render(<CardHeader data-testid="header" className="extra">Header</CardHeader>);
    expect(screen.getByTestId("header").className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardHeader ref={ref}>Header</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("CardContent", () => {
  it("renders with wui-card__content class", () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId("content").className).toContain("wui-card__content");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardContent ref={ref}>Content</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("CardFooter", () => {
  it("renders with wui-card__footer class", () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId("footer").className).toContain("wui-card__footer");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("Card compound usage", () => {
  it("renders all sub-components together", () => {
    render(
      <Card>
        <CardHeader data-testid="header">Title</CardHeader>
        <CardContent data-testid="content">Body</CardContent>
        <CardFooter data-testid="footer">Actions</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});

// E.12 variant + asChild
describe("Card variants", () => {
  it("does not apply variant class for default elevated", () => {
    render(<Card>x</Card>);
    expect(screen.getByText("x").className).not.toContain("wui-card--elevated");
  });

  it("applies outlined variant class", () => {
    render(<Card variant="outlined">x</Card>);
    expect(screen.getByText("x").className).toContain("wui-card--outlined");
  });

  it("applies filled variant class", () => {
    render(<Card variant="filled">x</Card>);
    expect(screen.getByText("x").className).toContain("wui-card--filled");
  });
});

describe("Card asChild", () => {
  it("renders as the child element when asChild is true", () => {
    render(
      <Card asChild>
        <a href="/path" data-testid="link">Click me</a>
      </Card>,
    );
    const link = screen.getByTestId("link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/path");
    expect(link.className).toContain("wui-card");
  });

  it("merges child className with card classes", () => {
    render(
      <Card asChild className="extra" variant="outlined">
        <a href="/" className="child-class" data-testid="link">Link</a>
      </Card>,
    );
    const link = screen.getByTestId("link");
    expect(link.className).toContain("wui-card");
    expect(link.className).toContain("wui-card--outlined");
    expect(link.className).toContain("extra");
    expect(link.className).toContain("child-class");
  });
});
