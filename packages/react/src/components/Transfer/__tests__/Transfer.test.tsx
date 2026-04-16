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
});
