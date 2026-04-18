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

  describe("external auto-detection (P1)", () => {
    it("detects https URLs as external", () => {
      render(<Link href="https://example.com">Ext</Link>);
      const link = screen.getByRole("link", { name: /Ext/ });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAttribute("data-external");
    });

    it("detects mailto URLs as external", () => {
      render(<Link href="mailto:x@example.com">Mail</Link>);
      expect(screen.getByRole("link", { name: /Mail/ })).toHaveAttribute("data-external");
    });

    it("internal URLs are not marked external", () => {
      render(<Link href="/docs">Docs</Link>);
      expect(screen.getByRole("link", { name: /Docs/ })).not.toHaveAttribute("data-external");
    });

    it("explicit external=false overrides auto-detect", () => {
      render(
        <Link href="https://example.com" external={false}>
          Forced internal
        </Link>,
      );
      const link = screen.getByRole("link", { name: /Forced internal/ });
      expect(link).not.toHaveAttribute("target");
    });

    it("renders an external-icon after the text", () => {
      render(<Link href="https://example.com">Ext</Link>);
      expect(screen.getByRole("link")).toContainHTML("wui-link__external-icon");
    });

    it("showExternalIcon=false hides the icon", () => {
      const { container } = render(
        <Link href="https://example.com" showExternalIcon={false}>
          Ext
        </Link>,
      );
      expect(container.querySelector(".wui-link__external-icon")).not.toBeInTheDocument();
    });
  });

  describe("underline variants (P1)", () => {
    it("defaults to always", () => {
      render(<Link href="/">x</Link>);
      expect(screen.getByRole("link")).toHaveAttribute("data-underline", "always");
    });

    it("applies data-underline=hover", () => {
      render(
        <Link href="/" underline="hover">
          x
        </Link>,
      );
      expect(screen.getByRole("link")).toHaveAttribute("data-underline", "hover");
    });

    it("applies data-underline=none", () => {
      render(
        <Link href="/" underline="none">
          x
        </Link>,
      );
      expect(screen.getByRole("link")).toHaveAttribute("data-underline", "none");
    });
  });
});
