import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../Tabs";

describe("Tabs (React re-export)", () => {
  it("renders tab triggers and content", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content-a</TabsContent>
        <TabsContent value="b">content-b</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("content-a")).toBeInTheDocument();
  });

  it("shows only the active tab's content", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content-a</TabsContent>
        <TabsContent value="b">content-b</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("content-a")).toBeInTheDocument();
    expect(screen.queryByText("content-b")).not.toBeInTheDocument();
  });

  it("switches panels when a trigger is clicked (uncontrolled)", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content-a</TabsContent>
        <TabsContent value="b">content-b</TabsContent>
      </Tabs>,
    );
    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.queryByText("content-a")).not.toBeInTheDocument();
    expect(screen.getByText("content-b")).toBeInTheDocument();
  });

  it("calls onValueChange when a trigger is clicked", () => {
    const onValueChange = vi.fn();
    render(
      <Tabs defaultValue="a" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content-a</TabsContent>
        <TabsContent value="b">content-b</TabsContent>
      </Tabs>,
    );
    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("respects the controlled `value` prop", () => {
    const { rerender } = render(
      <Tabs value="a" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content-a</TabsContent>
        <TabsContent value="b">content-b</TabsContent>
      </Tabs>,
    );
    // Clicking shouldn't change visible content without parent re-rendering
    fireEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("content-a")).toBeInTheDocument();

    rerender(
      <Tabs value="b" onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content-a</TabsContent>
        <TabsContent value="b">content-b</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("content-b")).toBeInTheDocument();
  });

  it("sets aria-selected and roving tabindex on the active trigger", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">content-a</TabsContent>
        <TabsContent value="b">content-b</TabsContent>
      </Tabs>,
    );
    const trigA = screen.getByRole("tab", { name: "A" });
    const trigB = screen.getByRole("tab", { name: "B" });
    expect(trigA).toHaveAttribute("aria-selected", "true");
    expect(trigA).toHaveAttribute("tabindex", "0");
    expect(trigB).toHaveAttribute("aria-selected", "false");
    expect(trigB).toHaveAttribute("tabindex", "-1");
  });

  it("applies the wui-tabs class hierarchy", () => {
    const { container } = render(
      <Tabs defaultValue="a" className="extra">
        <TabsList className="list-extra">
          <TabsTrigger value="a" className="trig-extra">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="content-extra">x</TabsContent>
      </Tabs>,
    );
    expect(container.querySelector(".wui-tabs.extra")).toBeInTheDocument();
    expect(container.querySelector(".wui-tabs__list.list-extra")).toBeInTheDocument();
    expect(container.querySelector(".wui-tabs__trigger.trig-extra")).toBeInTheDocument();
    expect(container.querySelector(".wui-tabs__content.content-extra")).toBeInTheDocument();
  });
});
