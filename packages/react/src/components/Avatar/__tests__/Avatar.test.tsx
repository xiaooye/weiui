import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from "../Avatar";

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

// E.10 auto-initials + src + onError + color-from-name + AvatarGroup
describe("Avatar auto-initials", () => {
  it("generates initials from a two-word name", () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("uses first two letters for a single-word name", () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("uses first and last initial for 3+ words", () => {
    render(<Avatar name="Mary Ann Jones" />);
    expect(screen.getByText("MJ")).toBeInTheDocument();
  });

  it("children override initials", () => {
    render(<Avatar name="Jane Doe"><span>X</span></Avatar>);
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.queryByText("JD")).not.toBeInTheDocument();
  });

  it("renders img when src is provided", () => {
    render(<Avatar src="/img.png" name="Jane Doe" />);
    const img = screen.getByAltText("Jane Doe") as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveAttribute("src", "/img.png");
  });

  it("falls back to initials when image errors", () => {
    render(<Avatar src="/missing.png" name="Jane Doe" />);
    const img = screen.getByAltText("Jane Doe") as HTMLImageElement;
    fireEvent.error(img);
    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.queryByAltText("Jane Doe")).not.toBeInTheDocument();
  });

  it("applies color class when colorFromName is enabled", () => {
    const { container } = render(<Avatar name="Jane Doe" data-testid="a" />);
    const avatar = container.querySelector(".wui-avatar") as HTMLElement;
    const hasColorClass =
      avatar.className.includes("wui-avatar--primary") ||
      avatar.className.includes("wui-avatar--success") ||
      avatar.className.includes("wui-avatar--warning") ||
      avatar.className.includes("wui-avatar--destructive");
    expect(hasColorClass).toBe(true);
  });

  it("color-from-name is deterministic for the same name", () => {
    const { container: c1 } = render(<Avatar name="Alice" />);
    const { container: c2 } = render(<Avatar name="Alice" />);
    expect(c1.firstChild?.className).toBe(c2.firstChild?.className);
  });

  it("colorFromName={false} disables color class", () => {
    const { container } = render(<Avatar name="Jane Doe" colorFromName={false} />);
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).not.toMatch(/wui-avatar--primary|wui-avatar--success|wui-avatar--warning|wui-avatar--destructive/);
  });
});

describe("AvatarGroup", () => {
  it("renders all avatars when under max", () => {
    render(
      <AvatarGroup max={3}>
        <Avatar name="A A" />
        <Avatar name="B B" />
      </AvatarGroup>,
    );
    expect(screen.getByText("AA")).toBeInTheDocument();
    expect(screen.getByText("BB")).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("truncates to max and shows overflow count", () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="A A" />
        <Avatar name="B B" />
        <Avatar name="C C" />
        <Avatar name="D D" />
      </AvatarGroup>,
    );
    expect(screen.getByText("AA")).toBeInTheDocument();
    expect(screen.getByText("BB")).toBeInTheDocument();
    expect(screen.queryByText("CC")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("overflow chip has aria-label", () => {
    render(
      <AvatarGroup max={1}>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
      </AvatarGroup>,
    );
    expect(screen.getByLabelText("2 more")).toBeInTheDocument();
  });

  it("applies wui-avatar-group class", () => {
    render(
      <AvatarGroup data-testid="g">
        <Avatar name="A" />
      </AvatarGroup>,
    );
    expect(screen.getByTestId("g").className).toContain("wui-avatar-group");
  });
});
