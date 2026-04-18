import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Transfer } from "../Transfer";

const sourceItems = [
  { value: "a", label: "Item A" },
  { value: "b", label: "Item B" },
];

describe("Transfer", () => {
  it("renders source and target lists", () => {
    render(<Transfer sourceItems={sourceItems} />);
    expect(screen.getByRole("listbox", { name: "Available items" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Selected items" })).toBeInTheDocument();
  });

  it("renders source items", () => {
    render(<Transfer sourceItems={sourceItems} />);
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
  });

  it("selects a source item on click (checkbox checked)", async () => {
    const user = userEvent.setup();
    render(<Transfer sourceItems={sourceItems} />);

    const itemA = screen.getByText("Item A").closest("[role='option']")!;
    await user.click(itemA);

    expect(itemA).toHaveAttribute("aria-selected", "true");
  });

  it("moves selected items to target on move-right click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Transfer sourceItems={sourceItems} onChange={onChange} />);

    const itemA = screen.getByText("Item A").closest("[role='option']")!;
    await user.click(itemA);

    const moveRight = screen.getByRole("button", { name: "Move selected to target" });
    await user.click(moveRight);

    // Item A should now be in the target list
    const targetList = screen.getByRole("listbox", { name: "Selected items" });
    expect(targetList).toHaveTextContent("Item A");

    // Item A should no longer be in the source list
    const sourceList = screen.getByRole("listbox", { name: "Available items" });
    expect(sourceList).not.toHaveTextContent("Item A");
  });

  it("moves selected items back to source on move-left click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Transfer
        sourceItems={[{ value: "a", label: "Item A" }]}
        targetItems={[{ value: "b", label: "Item B" }]}
        onChange={onChange}
      />,
    );

    // Select Item B in the target list
    const itemB = screen.getByText("Item B").closest("[role='option']")!;
    await user.click(itemB);

    const moveLeft = screen.getByRole("button", { name: "Move selected to source" });
    await user.click(moveLeft);

    // Item B should now be in the source list
    const sourceList = screen.getByRole("listbox", { name: "Available items" });
    expect(sourceList).toHaveTextContent("Item B");
  });

  it("disables move buttons when nothing is selected", () => {
    render(<Transfer sourceItems={sourceItems} />);
    expect(screen.getByRole("button", { name: "Move selected to target" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move selected to source" })).toBeDisabled();
  });

  it("calls onChange with updated source and target arrays", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Transfer sourceItems={sourceItems} onChange={onChange} />);

    const itemA = screen.getByText("Item A").closest("[role='option']")!;
    await user.click(itemA);

    const moveRight = screen.getByRole("button", { name: "Move selected to target" });
    await user.click(moveRight);

    expect(onChange).toHaveBeenCalledWith(
      [{ value: "b", label: "Item B" }],
      [{ value: "a", label: "Item A" }],
    );
  });

  describe("controlled targetValues (P0)", () => {
    it("renders items in target based on `targetValues`", () => {
      render(<Transfer sourceItems={sourceItems} targetValues={["a"]} />);
      const targetList = screen.getByRole("listbox", { name: "Selected items" });
      const sourceList = screen.getByRole("listbox", { name: "Available items" });
      expect(targetList).toHaveTextContent("Item A");
      expect(sourceList).toHaveTextContent("Item B");
      expect(sourceList).not.toHaveTextContent("Item A");
    });

    it("calls onTargetValuesChange when moving items right", async () => {
      const user = userEvent.setup();
      const onTargetValuesChange = vi.fn();
      render(
        <Transfer
          sourceItems={sourceItems}
          targetValues={[]}
          onTargetValuesChange={onTargetValuesChange}
        />,
      );

      const itemA = screen.getByText("Item A").closest("[role='option']")!;
      await user.click(itemA);
      await user.click(screen.getByRole("button", { name: "Move selected to target" }));

      expect(onTargetValuesChange).toHaveBeenCalledWith(["a"]);
    });

    it("does NOT mutate internal state when controlled (consumer must update prop)", async () => {
      const user = userEvent.setup();
      render(<Transfer sourceItems={sourceItems} targetValues={[]} />);

      const itemA = screen.getByText("Item A").closest("[role='option']")!;
      await user.click(itemA);
      await user.click(screen.getByRole("button", { name: "Move selected to target" }));

      // Still empty because the prop didn't change
      const targetList = screen.getByRole("listbox", { name: "Selected items" });
      expect(targetList).not.toHaveTextContent("Item A");
    });

    it("reflects controlled prop change", () => {
      const { rerender } = render(<Transfer sourceItems={sourceItems} targetValues={[]} />);
      const targetList = screen.getByRole("listbox", { name: "Selected items" });
      expect(targetList).not.toHaveTextContent("Item A");

      rerender(<Transfer sourceItems={sourceItems} targetValues={["a"]} />);
      expect(screen.getByRole("listbox", { name: "Selected items" })).toHaveTextContent("Item A");
    });
  });

  describe("select all per pane (P1)", () => {
    it("renders a select-all checkbox in each pane", () => {
      render(<Transfer sourceItems={sourceItems} />);
      expect(screen.getByRole("checkbox", { name: /select all available/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /select all selected/i })).toBeInTheDocument();
    });

    it("select-all toggles all enabled items", async () => {
      const user = userEvent.setup();
      render(<Transfer sourceItems={sourceItems} />);
      const all = screen.getByRole("checkbox", { name: /select all available/i });
      await user.click(all);
      const itemA = screen.getByText("Item A").closest("[role='option']")!;
      const itemB = screen.getByText("Item B").closest("[role='option']")!;
      expect(itemA).toHaveAttribute("aria-selected", "true");
      expect(itemB).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("move all (P1)", () => {
    it("renders Move-all buttons in each direction", () => {
      render(<Transfer sourceItems={sourceItems} />);
      expect(screen.getByRole("button", { name: /move all to target/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /move all to source/i })).toBeInTheDocument();
    });

    it("Move-all-right transfers every enabled source item", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Transfer sourceItems={sourceItems} onChange={onChange} />);
      await user.click(screen.getByRole("button", { name: /move all to target/i }));
      expect(onChange).toHaveBeenCalled();
      const targetList = screen.getByRole("listbox", { name: "Selected items" });
      expect(targetList).toHaveTextContent("Item A");
      expect(targetList).toHaveTextContent("Item B");
    });
  });

  describe("search per pane (P1)", () => {
    it("renders a search input per pane when searchable", () => {
      render(<Transfer sourceItems={sourceItems} searchable />);
      expect(screen.getByRole("textbox", { name: /search available/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /search selected/i })).toBeInTheDocument();
    });

    it("filters source items by search", async () => {
      const user = userEvent.setup();
      render(<Transfer sourceItems={sourceItems} searchable />);
      const search = screen.getByRole("textbox", { name: /search available/i });
      await user.type(search, "Item A");
      expect(screen.getByText("Item A")).toBeInTheDocument();
      expect(screen.queryByText("Item B")).not.toBeInTheDocument();
    });
  });

  describe("keyboard (P1)", () => {
    it("Space/Enter toggles focused item selection", async () => {
      const user = userEvent.setup();
      render(<Transfer sourceItems={sourceItems} />);
      const listbox = screen.getByRole("listbox", { name: "Available items" });
      listbox.focus();
      await user.keyboard(" ");
      const itemA = screen.getByText("Item A").closest("[role='option']")!;
      expect(itemA).toHaveAttribute("aria-selected", "true");
    });
  });
});
