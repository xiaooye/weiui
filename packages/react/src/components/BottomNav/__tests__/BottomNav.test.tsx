import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  describe("controlled value (P1)", () => {
    it("marks the item whose value matches BottomNav.value as active", () => {
      render(
        <BottomNav value="home">
          <BottomNavItem label="Home" value="home" />
          <BottomNavItem label="Profile" value="profile" />
        </BottomNav>,
      );
      expect(screen.getByText("Home").closest("button")).toHaveAttribute("aria-current", "page");
      expect(screen.getByText("Profile").closest("button")).not.toHaveAttribute("aria-current");
    });

    it("fires onValueChange when an item is clicked", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <BottomNav value="home" onValueChange={onValueChange}>
          <BottomNavItem label="Home" value="home" />
          <BottomNavItem label="Profile" value="profile" />
        </BottomNav>,
      );
      await user.click(screen.getByText("Profile"));
      expect(onValueChange).toHaveBeenCalledWith("profile");
    });
  });

  describe("showLabels (P1)", () => {
    it("defaults to always", () => {
      render(
        <BottomNav>
          <BottomNavItem label="Home" />
        </BottomNav>,
      );
      expect(screen.getByRole("navigation")).toHaveAttribute("data-show-labels", "always");
    });
    it("applies data-show-labels", () => {
      render(
        <BottomNav showLabels="active">
          <BottomNavItem label="Home" />
        </BottomNav>,
      );
      expect(screen.getByRole("navigation")).toHaveAttribute("data-show-labels", "active");
    });
  });

  describe("badge (P1)", () => {
    it("renders a badge when provided", () => {
      render(
        <BottomNav>
          <BottomNavItem label="Notifications" icon="*" badge={3} />
        </BottomNav>,
      );
      expect(screen.getByText("3")).toBeInTheDocument();
    });
    it("does not render badge when falsy", () => {
      const { container } = render(
        <BottomNav>
          <BottomNavItem label="Notifications" icon="*" />
        </BottomNav>,
      );
      expect(container.querySelector(".wui-bottom-nav__badge")).not.toBeInTheDocument();
    });
  });
});
