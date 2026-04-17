import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav, BottomNavItem } from "../BottomNav";

describe("BottomNav", () => {
  it("renders a nav element with label", () => {
    render(
      <BottomNav>
        <BottomNavItem label="Home" />
      </BottomNav>,
    );
    const nav = screen.getByRole("navigation", { name: /bottom navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it("applies wui-bottom-nav class (target of safe-area padding — P0)", () => {
    render(
      <BottomNav>
        <BottomNavItem label="Home" />
      </BottomNav>,
    );
    const nav = screen.getByRole("navigation", { name: /bottom navigation/i });
    expect(nav.className).toContain("wui-bottom-nav");
  });

  it("renders items with labels", () => {
    render(
      <BottomNav>
        <BottomNavItem label="Home" />
        <BottomNavItem label="Settings" />
      </BottomNav>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("active item has aria-current", () => {
    render(
      <BottomNav>
        <BottomNavItem label="Home" active />
      </BottomNav>,
    );
    expect(screen.getByText("Home").closest("button")).toHaveAttribute("aria-current", "page");
  });
});
