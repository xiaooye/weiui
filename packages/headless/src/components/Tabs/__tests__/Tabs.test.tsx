import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "../Tabs";
import { TabsList } from "../TabsList";
import { TabsTrigger } from "../TabsTrigger";
import { TabsContent } from "../TabsContent";

function TestTabs() {
  return (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">Tab A</TabsTrigger>
        <TabsTrigger value="b">Tab B</TabsTrigger>
        <TabsTrigger value="c">Tab C</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Content A</TabsContent>
      <TabsContent value="b">Content B</TabsContent>
      <TabsContent value="c">Content C</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows default tab content", () => {
    render(<TestTabs />);
    expect(screen.getByText("Content A")).toBeInTheDocument();
    expect(screen.queryByText("Content B")).not.toBeInTheDocument();
  });

  it("switches tab on click", async () => {
    render(<TestTabs />);
    await userEvent.setup().click(screen.getByText("Tab B"));
    expect(screen.queryByText("Content A")).not.toBeInTheDocument();
    expect(screen.getByText("Content B")).toBeInTheDocument();
  });

  it("has correct ARIA roles", () => {
    render(<TestTabs />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
  });

  it("sets aria-selected on active tab", () => {
    render(<TestTabs />);
    expect(screen.getByText("Tab A")).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Tab B")).toHaveAttribute("aria-selected", "false");
  });

  it("uses roving tabindex", () => {
    render(<TestTabs />);
    expect(screen.getByText("Tab A")).toHaveAttribute("tabIndex", "0");
    expect(screen.getByText("Tab B")).toHaveAttribute("tabIndex", "-1");
  });

  it("links tab to panel via aria-controls", () => {
    render(<TestTabs />);
    const tab = screen.getByText("Tab A");
    const panel = screen.getByRole("tabpanel");
    expect(tab.getAttribute("aria-controls")).toBe(panel.id);
  });

  describe("arrow key navigation (P0)", () => {
    it("ArrowRight moves focus to next tab", async () => {
      const user = userEvent.setup();
      render(<TestTabs />);
      const tabA = screen.getByText("Tab A");
      tabA.focus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByText("Tab B")).toHaveFocus();
    });

    it("ArrowLeft moves focus to previous tab", async () => {
      const user = userEvent.setup();
      render(<TestTabs />);
      screen.getByText("Tab B").focus();
      await user.keyboard("{ArrowLeft}");
      expect(screen.getByText("Tab A")).toHaveFocus();
    });

    it("ArrowRight loops from last to first", async () => {
      const user = userEvent.setup();
      render(<TestTabs />);
      screen.getByText("Tab C").focus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByText("Tab A")).toHaveFocus();
    });

    it("Home focuses first tab", async () => {
      const user = userEvent.setup();
      render(<TestTabs />);
      screen.getByText("Tab C").focus();
      await user.keyboard("{Home}");
      expect(screen.getByText("Tab A")).toHaveFocus();
    });

    it("End focuses last tab", async () => {
      const user = userEvent.setup();
      render(<TestTabs />);
      screen.getByText("Tab A").focus();
      await user.keyboard("{End}");
      expect(screen.getByText("Tab C")).toHaveFocus();
    });

    it("TabsList has aria-orientation", () => {
      render(<TestTabs />);
      expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("ArrowDown moves focus in vertical orientation", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="a">
          <TabsList orientation="vertical">
            <TabsTrigger value="a">Tab A</TabsTrigger>
            <TabsTrigger value="b">Tab B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Content A</TabsContent>
          <TabsContent value="b">Content B</TabsContent>
        </Tabs>,
      );
      screen.getByText("Tab A").focus();
      await user.keyboard("{ArrowDown}");
      expect(screen.getByText("Tab B")).toHaveFocus();
    });
  });
});
