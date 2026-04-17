import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Heading } from "../Heading";

describe("Heading", () => {
  it("renders as h2 by default", () => {
    render(<Heading>Default</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders correct heading level for each level 1-6", () => {
    const levels = [1, 2, 3, 4, 5, 6] as const;
    for (const level of levels) {
      const { unmount } = render(<Heading level={level}>Level {level}</Heading>);
      expect(screen.getByRole("heading", { level })).toBeInTheDocument();
      unmount();
    }
  });

  it("applies size class for h1", () => {
    render(<Heading level={1}>H1</Heading>);
    expect(screen.getByRole("heading", { level: 1 }).className).toContain("text-4xl");
  });

  it("applies size class for h3", () => {
    render(<Heading level={3}>H3</Heading>);
    expect(screen.getByRole("heading", { level: 3 }).className).toContain("text-2xl");
  });

  it("merges custom className", () => {
    render(<Heading className="custom">Title</Heading>);
    expect(screen.getByRole("heading").className).toContain("custom");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<Heading ref={ref}>Ref test</Heading>);
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});
