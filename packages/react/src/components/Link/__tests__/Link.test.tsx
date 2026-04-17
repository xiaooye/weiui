import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Link } from "../Link";

describe("Link", () => {
  it("renders as anchor", () => {
    render(<Link href="/about">About</Link>);
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
  });

  it("external link has target='_blank' and rel='noopener noreferrer'", () => {
    render(
      <Link href="https://example.com" external>
        External
      </Link>,
    );
    const link = screen.getByRole("link", { name: "External" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("non-external link does not have target", () => {
    render(<Link href="/internal">Internal</Link>);
    const link = screen.getByRole("link", { name: "Internal" });
    expect(link).not.toHaveAttribute("target");
  });

  it("merges custom className", () => {
    render(<Link href="/test" className="custom">Link</Link>);
    expect(screen.getByRole("link").className).toContain("custom");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<Link ref={ref}>Ref Link</Link>);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });
});
