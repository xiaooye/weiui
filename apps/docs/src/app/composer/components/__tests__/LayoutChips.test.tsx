import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutChips } from "../LayoutChips";
import { makeNode, type ComponentNode } from "../../lib/tree";

const rect = { top: 100, left: 50, width: 200, height: 80 };

/**
 * Wrapper that threads onUpdate back into node.props so controlled inputs
 * reflect the user's edits (the real page.tsx does this via the reducer).
 */
function ChipsHarness({
  initial,
  onUpdate,
}: {
  initial: ComponentNode;
  onUpdate?: (props: Record<string, unknown>) => void;
}) {
  const [node, setNode] = useState<ComponentNode>(initial);
  return (
    <LayoutChips
      node={node}
      rect={rect}
      onUpdate={(props) => {
        onUpdate?.(props);
        setNode({ ...node, props });
      }}
    />
  );
}

describe("LayoutChips", () => {
  it("renders nothing for non-container types", () => {
    const btn = makeNode("Button", {});
    const { container } = render(
      <LayoutChips node={btn} rect={rect} onUpdate={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders direction + gap controls for Stack", () => {
    const stack = makeNode("Stack", { direction: "column", gap: 3 });
    render(<LayoutChips node={stack} rect={rect} onUpdate={() => {}} />);
    expect(screen.getByRole("toolbar", { name: "Stack layout" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Horizontal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Vertical" })).toBeInTheDocument();
    // The Slider thumb carries the "Gap" label + aria-valuenow.
    const gapThumb = screen.getByRole("slider", { name: "Gap" });
    expect(gapThumb).toHaveAttribute("aria-valuenow", "3");
  });

  it("Stack direction toggle dispatches onUpdate with merged props", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const stack = makeNode("Stack", { direction: "column", gap: 2 });
    render(<LayoutChips node={stack} rect={rect} onUpdate={onUpdate} />);
    await user.click(screen.getByRole("button", { name: "Horizontal" }));
    expect(onUpdate).toHaveBeenCalledWith({ direction: "row", gap: 2 });
  });

  it("Stack gap slider dispatches numeric onUpdate via keyboard", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const stack = makeNode("Stack", { direction: "row", gap: 2 });
    render(<ChipsHarness initial={stack} onUpdate={onUpdate} />);
    const gapThumb = screen.getByRole("slider", { name: "Gap" });
    gapThumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onUpdate).toHaveBeenLastCalledWith({ direction: "row", gap: 3 });
  });

  it("renders columns + gap sliders for Grid", () => {
    const grid = makeNode("Grid", { columns: 4, gap: 2 });
    render(<LayoutChips node={grid} rect={rect} onUpdate={() => {}} />);
    expect(screen.getByRole("toolbar", { name: "Grid layout" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Columns" })).toHaveAttribute(
      "aria-valuenow",
      "4",
    );
    expect(screen.getByRole("slider", { name: "Gap" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
  });

  it("Grid columns slider dispatches numeric onUpdate preserving other props", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const grid = makeNode("Grid", { columns: 3, gap: 2 });
    render(<ChipsHarness initial={grid} onUpdate={onUpdate} />);
    const cols = screen.getByRole("slider", { name: "Columns" });
    cols.focus();
    await user.keyboard("{ArrowRight}");
    expect(onUpdate).toHaveBeenLastCalledWith({ columns: 4, gap: 2 });
  });

  it("renders a max-width select for Container", () => {
    const container = makeNode("Container", { maxWidth: "40rem" });
    render(<LayoutChips node={container} rect={rect} onUpdate={() => {}} />);
    expect(screen.getByRole("toolbar", { name: "Container layout" })).toBeInTheDocument();
    const select = screen.getByLabelText("Max width");
    expect(select).toHaveValue("40rem");
  });

  it("Container max-width select dispatches onUpdate", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const container = makeNode("Container", { maxWidth: "40rem" });
    render(<LayoutChips node={container} rect={rect} onUpdate={onUpdate} />);
    await user.selectOptions(screen.getByLabelText("Max width"), "80rem");
    expect(onUpdate).toHaveBeenCalledWith({ maxWidth: "80rem" });
  });

  it("positions above the selection when space allows", () => {
    const stack = makeNode("Stack", {});
    const { container } = render(
      <LayoutChips node={stack} rect={{ top: 200, left: 10, width: 50, height: 50 }} onUpdate={() => {}} />,
    );
    const chips = container.querySelector<HTMLElement>(".wui-composer__chips");
    expect(chips).not.toBeNull();
    // 200 - 40 - 8 = 152
    expect(chips!.style.insetBlockStart).toBe("152px");
  });

  it("falls back below the selection when there is no room above", () => {
    const stack = makeNode("Stack", {});
    const { container } = render(
      <LayoutChips node={stack} rect={{ top: 10, left: 10, width: 50, height: 50 }} onUpdate={() => {}} />,
    );
    const chips = container.querySelector<HTMLElement>(".wui-composer__chips");
    // 10 + 50 + 8 = 68
    expect(chips!.style.insetBlockStart).toBe("68px");
  });
});
