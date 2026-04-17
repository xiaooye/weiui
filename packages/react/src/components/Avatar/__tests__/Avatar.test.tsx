import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback } from "../Avatar";

describe("Avatar", () => {
  it("renders children", () => {
    render(<Avatar><span>JD</span></Avatar>);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("applies wui-avatar class", () => {
    render(<Avatar data-testid="avatar"><span>JD</span></Avatar>);
    expect(screen.getByTestId("avatar").className).toContain("wui-avatar");
  });

  it("does not apply size class for default md", () => {
    render(<Avatar data-testid="avatar"><span>JD</span></Avatar>);
    expect(screen.getByTestId("avatar").className).not.toContain("wui-avatar--md");
  });

  it("applies size class for non-default sizes", () => {
    render(<Avatar size="lg" data-testid="avatar"><span>JD</span></Avatar>);
    expect(screen.getByTestId("avatar").className).toContain("wui-avatar--lg");
  });

  it("merges custom className", () => {
    render(<Avatar className="extra" data-testid="avatar"><span>JD</span></Avatar>);
    expect(screen.getByTestId("avatar").className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref}><span>JD</span></Avatar>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe("AvatarImage", () => {
  it("renders an img element with wui-avatar__image class", () => {
    render(<AvatarImage src="/avatar.jpg" alt="User" />);
    const img = screen.getByAltText("User");
    expect(img.tagName).toBe("IMG");
    expect(img.className).toContain("wui-avatar__image");
  });

  it("defaults alt to empty string", () => {
    render(<AvatarImage src="/avatar.jpg" />);
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    render(<AvatarImage className="extra" alt="User" />);
    expect(screen.getByAltText("User").className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLImageElement>();
    render(<AvatarImage ref={ref} alt="User" />);
    expect(ref.current).toBeInstanceOf(HTMLImageElement);
  });
});

describe("AvatarFallback", () => {
  it("renders with wui-avatar__fallback class", () => {
    render(<AvatarFallback data-testid="fallback">JD</AvatarFallback>);
    expect(screen.getByTestId("fallback").className).toContain("wui-avatar__fallback");
  });

  it("merges custom className", () => {
    render(<AvatarFallback data-testid="fallback" className="extra">JD</AvatarFallback>);
    expect(screen.getByTestId("fallback").className).toContain("extra");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<AvatarFallback ref={ref}>JD</AvatarFallback>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe("Avatar compound usage", () => {
  it("renders AvatarImage and AvatarFallback inside Avatar", () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.jpg" alt="User" />
        <AvatarFallback data-testid="fallback">JD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByAltText("User")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
  });
});
