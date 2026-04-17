import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TreeView } from "../TreeView";

const nodes = [
  {
    id: "1",
    label: "Root",
    children: [
      { id: "1.1", label: "Child 1" },
      { id: "1.2", label: "Child 2" },
    ],
  },
  { id: "2", label: "Leaf" },
];

describe("TreeView", () => {
  it("renders tree nodes", () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.getByText("Root")).toBeInTheDocument();
    expect(screen.getByText("Leaf")).toBeInTheDocument();
  });

  it("has role='tree' on the root element", () => {
    render(<TreeView nodes={nodes} />);
    expect(screen.getByRole("tree")).toBeInTheDocument();
  });

  it("has role='treeitem' on nodes", () => {
    render(<TreeView nodes={nodes} defaultExpanded={["1"]} />);
    const treeitems = screen.getAllByRole("treeitem");
    expect(treeitems.length).toBe(4); // Root, Child 1, Child 2, Leaf
  });

  it("has aria-expanded on branch nodes", () => {
    render(<TreeView nodes={nodes} />);
    const rootItem = screen.getByText("Root").closest("[role='treeitem']")!;
    expect(rootItem).toHaveAttribute("aria-expanded", "false");

    // Leaf node should not have aria-expanded
    const leafItem = screen.getByText("Leaf").closest("[role='treeitem']")!;
    expect(leafItem).not.toHaveAttribute("aria-expanded");
  });

  it("expands/collapses children when clicking a branch node", async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={nodes} />);

    // Initially collapsed
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument();

    // Click to expand
    await user.click(screen.getByText("Root"));
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();

    // Click again to collapse
    await user.click(screen.getByText("Root"));
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument();
  });

  it("moves focus down with ArrowDown", async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={nodes} defaultExpanded={["1"]} />);

    // Focus Root via tab, then ArrowDown to Child 1
    await user.tab();
    const rootBtn = screen.getByText("Root").closest("button")!;
    expect(rootBtn).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    const child1Btn = screen.getByText("Child 1").closest("button")!;
    expect(child1Btn).toHaveFocus();
  });

  it("moves focus up with ArrowUp", async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={nodes} defaultExpanded={["1"]} />);

    // Focus Child 1 directly, then ArrowUp to Root
    const child1Btn = screen.getByText("Child 1").closest("button")!;
    child1Btn.focus();
    await user.keyboard("{ArrowUp}");

    const rootBtn = screen.getByText("Root").closest("button")!;
    expect(rootBtn).toHaveFocus();
  });

  it("expands a collapsed node with ArrowRight", async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={nodes} />);

    // Root starts collapsed (no defaultExpanded)
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument();

    // Focus Root via tab, then ArrowRight to expand
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Child 1")).toBeInTheDocument();
  });

  it("collapses an expanded node with ArrowLeft", async () => {
    const user = userEvent.setup();
    render(<TreeView nodes={nodes} defaultExpanded={["1"]} />);

    // Focus Root via tab, then ArrowLeft to collapse
    await user.tab();
    expect(screen.getByText("Child 1")).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}");
    expect(screen.queryByText("Child 1")).not.toBeInTheDocument();
  });

  it("selects a node on Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TreeView nodes={nodes} defaultExpanded={["1"]} onSelect={onSelect} />);

    const child1Btn = screen.getByText("Child 1").closest("button")!;
    child1Btn.focus();

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("1.1");
  });

  it("selects a node on Space", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<TreeView nodes={nodes} defaultExpanded={["1"]} onSelect={onSelect} />);

    const child1Btn = screen.getByText("Child 1").closest("button")!;
    child1Btn.focus();

    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledWith("1.1");
  });

  describe("controlled expanded (P0)", () => {
    it("renders expanded children when `expanded` prop includes id", () => {
      render(<TreeView nodes={nodes} expanded={["1"]} />);
      expect(screen.getByText("Child 1")).toBeInTheDocument();
    });

    it("ignores internal toggle when controlled (unless consumer updates prop)", async () => {
      const user = userEvent.setup();
      render(<TreeView nodes={nodes} expanded={[]} />);

      await user.click(screen.getByText("Root"));
      // Still collapsed because consumer didn't update the prop
      expect(screen.queryByText("Child 1")).not.toBeInTheDocument();
    });

    it("calls onExpandedChange when a branch is clicked", async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();
      render(<TreeView nodes={nodes} onExpandedChange={onExpandedChange} />);

      await user.click(screen.getByText("Root"));
      expect(onExpandedChange).toHaveBeenCalledWith(["1"]);
    });

    it("reflects controlled prop change", () => {
      const { rerender } = render(<TreeView nodes={nodes} expanded={[]} />);
      expect(screen.queryByText("Child 1")).not.toBeInTheDocument();

      rerender(<TreeView nodes={nodes} expanded={["1"]} />);
      expect(screen.getByText("Child 1")).toBeInTheDocument();
    });
  });
});
