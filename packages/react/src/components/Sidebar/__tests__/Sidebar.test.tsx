import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSubMenu,
} from "../Sidebar";

describe("Sidebar", () => {
  it("renders children", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem>Dashboard</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("applies wui-sidebar class", () => {
    render(<Sidebar data-testid="sidebar"><SidebarContent /></Sidebar>);
    expect(screen.getByTestId("sidebar").className).toContain("wui-sidebar");
  });

  it("is not collapsed by default", () => {
    render(<Sidebar data-testid="sidebar"><SidebarContent /></Sidebar>);
    expect(screen.getByTestId("sidebar")).not.toHaveAttribute("data-collapsed");
  });

  it("renders collapsed when defaultOpen is true", () => {
    render(<Sidebar data-testid="sidebar" defaultOpen><SidebarContent /></Sidebar>);
    expect(screen.getByTestId("sidebar")).toHaveAttribute("data-collapsed", "");
  });
});

describe("SidebarItem", () => {
  it("renders item text", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem>Settings</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("active item has data-active attribute", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem active data-testid="item">Home</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByTestId("item")).toHaveAttribute("data-active", "");
  });

  it("active item has aria-current='page'", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem active data-testid="item">Home</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByTestId("item")).toHaveAttribute("aria-current", "page");
  });

  it("inactive item does not have data-active", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem data-testid="item">Home</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByTestId("item")).not.toHaveAttribute("data-active");
  });

  it("applies wui-sidebar__item class", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem data-testid="item">Item</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByTestId("item").className).toContain("wui-sidebar__item");
  });
});

describe("Sidebar sub-components", () => {
  it("renders header, content, and footer", () => {
    render(
      <Sidebar>
        <SidebarHeader data-testid="header">Header</SidebarHeader>
        <SidebarContent data-testid="content">Content</SidebarContent>
        <SidebarFooter data-testid="footer">Footer</SidebarFooter>
      </Sidebar>,
    );
    expect(screen.getByTestId("header").className).toContain("wui-sidebar__header");
    expect(screen.getByTestId("content").className).toContain("wui-sidebar__content");
    expect(screen.getByTestId("footer").className).toContain("wui-sidebar__footer");
  });
});

describe("SidebarItem — icon-only collapsed mode (P0)", () => {
  it("wraps children in wui-sidebar__label span for collapsed hiding", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem data-testid="item">Home</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    const item = screen.getByTestId("item");
    const label = item.querySelector(".wui-sidebar__label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Home");
  });

  it("renders icon in wui-sidebar__icon span", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem icon={<span data-testid="home-icon">H</span>}>Home</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    const icon = screen.getByTestId("home-icon");
    expect(icon.parentElement?.className).toContain("wui-sidebar__icon");
  });
});

describe("SidebarTrigger (P1)", () => {
  it("renders as a toggle button", () => {
    render(
      <Sidebar>
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
      </Sidebar>,
    );
    expect(screen.getByRole("button", { name: /toggle sidebar/i })).toBeInTheDocument();
  });

  it("toggles collapsed state when clicked", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar data-testid="sb">
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
      </Sidebar>,
    );
    expect(screen.getByTestId("sb")).not.toHaveAttribute("data-collapsed");
    await user.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    expect(screen.getByTestId("sb")).toHaveAttribute("data-collapsed");
  });

  it("reflects aria-expanded", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar>
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
      </Sidebar>,
    );
    const trigger = screen.getByRole("button", { name: /toggle sidebar/i });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("fires onOpenChange from Sidebar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Sidebar onOpenChange={onOpenChange}>
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
      </Sidebar>,
    );
    await user.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    expect(onOpenChange).toHaveBeenCalled();
  });
});

describe("SidebarGroup + SidebarGroupLabel (P1)", () => {
  it("renders a role=group with label", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarItem>Dashboard</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByText("Workspace")).toBeInTheDocument();
  });
});

describe("SidebarSubMenu (P1)", () => {
  it("renders a collapsible submenu", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarSubMenu label="Settings">
            <SidebarItem>Profile</SidebarItem>
            <SidebarItem>Billing</SidebarItem>
          </SidebarSubMenu>
        </SidebarContent>
      </Sidebar>,
    );
    // Closed by default
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /settings/i }));
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("aria-expanded reflects open state", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarSubMenu label="Settings" defaultOpen>
            <SidebarItem>Profile</SidebarItem>
          </SidebarSubMenu>
        </SidebarContent>
      </Sidebar>,
    );
    const trigger = screen.getByRole("button", { name: /settings/i });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("SidebarItem — tooltip when collapsed (P1)", () => {
  it("renders title attribute when collapsed", () => {
    render(
      <Sidebar defaultOpen>
        <SidebarContent>
          <SidebarItem data-testid="item">Dashboard</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByTestId("item")).toHaveAttribute("title", "Dashboard");
  });

  it("no title when expanded", () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem data-testid="item">Dashboard</SidebarItem>
        </SidebarContent>
      </Sidebar>,
    );
    expect(screen.getByTestId("item")).not.toHaveAttribute("title");
  });
});
