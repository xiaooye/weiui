import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppBar, AppBarBrand, AppBarNav, AppBarLink, AppBarActions } from "../AppBar";

describe("AppBar", () => {
  it("renders children inside a header element", () => {
    render(<AppBar>Top bar content</AppBar>);
    expect(screen.getByText("Top bar content")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveClass("wui-app-bar");
  });

  it("merges custom className with base class", () => {
    render(<AppBar className="custom">x</AppBar>);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("wui-app-bar");
    expect(header).toHaveClass("custom");
  });

  it("renders all sub-components with correct semantics", () => {
    render(
      <AppBar>
        <AppBarBrand>Brand</AppBarBrand>
        <AppBarNav>
          <AppBarLink>Home</AppBarLink>
          <AppBarLink active>About</AppBarLink>
        </AppBarNav>
        <AppBarActions>
          <button type="button">Sign in</button>
        </AppBarActions>
      </AppBar>,
    );

    expect(screen.getByText("Brand")).toHaveClass("wui-app-bar__brand");
    expect(screen.getByRole("navigation")).toHaveClass("wui-app-bar__nav");
    expect(screen.getByText("Sign in").parentElement).toHaveClass("wui-app-bar__actions");
  });

  it("marks the active link with aria-current and data-active", () => {
    render(
      <AppBar>
        <AppBarNav>
          <AppBarLink>Home</AppBarLink>
          <AppBarLink active>About</AppBarLink>
        </AppBarNav>
      </AppBar>,
    );

    const home = screen.getByRole("button", { name: "Home" });
    const about = screen.getByRole("button", { name: "About" });

    expect(home).not.toHaveAttribute("aria-current");
    expect(home).not.toHaveAttribute("data-active");
    expect(about).toHaveAttribute("aria-current", "page");
    expect(about).toHaveAttribute("data-active", "true");
  });

  it("renders AppBarLink as a button by default (not anchor)", () => {
    render(
      <AppBar>
        <AppBarLink>Nav</AppBarLink>
      </AppBar>,
    );
    const link = screen.getByRole("button", { name: "Nav" });
    expect(link.tagName).toBe("BUTTON");
    expect(link).toHaveAttribute("type", "button");
  });

  describe("position variant (P1)", () => {
    it("defaults to sticky", () => {
      render(<AppBar>x</AppBar>);
      expect(screen.getByRole("banner")).toHaveAttribute("data-position", "sticky");
    });
    it("supports fixed position", () => {
      render(<AppBar position="fixed">x</AppBar>);
      expect(screen.getByRole("banner")).toHaveAttribute("data-position", "fixed");
    });
    it("supports static position", () => {
      render(<AppBar position="static">x</AppBar>);
      expect(screen.getByRole("banner")).toHaveAttribute("data-position", "static");
    });
  });

  describe("color variant (P1)", () => {
    it("defaults to surface", () => {
      render(<AppBar>x</AppBar>);
      expect(screen.getByRole("banner")).toHaveAttribute("data-color", "surface");
    });
    it("supports primary color", () => {
      render(<AppBar color="primary">x</AppBar>);
      expect(screen.getByRole("banner")).toHaveAttribute("data-color", "primary");
    });
    it("supports transparent color", () => {
      render(<AppBar color="transparent">x</AppBar>);
      expect(screen.getByRole("banner")).toHaveAttribute("data-color", "transparent");
    });
  });
});
