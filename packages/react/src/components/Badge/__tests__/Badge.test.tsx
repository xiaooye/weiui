import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies wui-badge class", () => {
    render(<Badge>label</Badge>);
    expect(screen.getByText("label").className).toContain("wui-badge");
  });

  it("applies default variant class", () => {
    render(<Badge>label</Badge>);
    expect(screen.getByText("label").className).toContain("wui-badge--solid");
  });

  it("applies variant class", () => {
    render(<Badge variant="outline">label</Badge>);
    expect(screen.getByText("label").className).toContain("wui-badge--outline");
  });

  it("does not apply primary color class (default)", () => {
    render(<Badge>label</Badge>);
    expect(screen.getByText("label").className).not.toContain("wui-badge--primary");
  });

  it("applies non-primary color class", () => {
    render(<Badge color="destructive">label</Badge>);
    expect(screen.getByText("label").className).toContain("wui-badge--destructive");
  });

  it("merges custom className", () => {
    render(<Badge className="extra">label</Badge>);
    expect(screen.getByText("label").className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLSpanElement>;
    render(<Badge ref={ref}>label</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
