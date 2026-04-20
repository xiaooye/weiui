import { describe, it, expect, vi } from "vitest";
import { useState, type ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutChips } from "../LayoutChips";
import { makeNode, type ComponentNode } from "../../lib/tree";
import { InteractionProvider } from "../../lib/interaction-manager";

/** Renders `ui` inside the InteractionProvider LayoutChips now depends on. */
function renderWithInteraction(ui: ReactElement) {
  return render(<InteractionProvider>{ui}</InteractionProvider>);
}

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
    renderWithInteraction(<LayoutChips node={btn} onUpdate={() => {}} />);
    // Container types render a toolbar; non-containers render no chips panel.
    expect(screen.queryByRole("toolbar")).toBeNull();
  });

  it("renders direction + gap controls for Stack", () => {
    const stack = makeNode("Stack", { direction: "column", gap: 3 });
    renderWithInteraction(<LayoutChips node={stack} onUpdate={() => {}} />);
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
    renderWithInteraction(<LayoutChips node={stack} onUpdate={onUpdate} />);
    await user.click(screen.getByRole("button", { name: "Horizontal" }));
    expect(onUpdate).toHaveBeenCalledWith({ direction: "row", gap: 2 });
  });

  it("Stack gap slider dispatches numeric onUpdate via keyboard", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const stack = makeNode("Stack", { direction: "row", gap: 2 });
    renderWithInteraction(<ChipsHarness initial={stack} onUpdate={onUpdate} />);
    const gapThumb = screen.getByRole("slider", { name: "Gap" });
    gapThumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onUpdate).toHaveBeenLastCalledWith({ direction: "row", gap: 3 });
  });

  it("renders columns + gap sliders for Grid", () => {
    const grid = makeNode("Grid", { columns: 4, gap: 2 });
    renderWithInteraction(<LayoutChips node={grid} onUpdate={() => {}} />);
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
    renderWithInteraction(<ChipsHarness initial={grid} onUpdate={onUpdate} />);
    const cols = screen.getByRole("slider", { name: "Columns" });
    cols.focus();
    await user.keyboard("{ArrowRight}");
    expect(onUpdate).toHaveBeenLastCalledWith({ columns: 4, gap: 2 });
  });

  it("renders a max-width select for Container", () => {
    const container = makeNode("Container", { maxWidth: "40rem" });
    renderWithInteraction(<LayoutChips node={container} onUpdate={() => {}} />);
    expect(screen.getByRole("toolbar", { name: "Container layout" })).toBeInTheDocument();
    const select = screen.getByLabelText("Max width");
    expect(select).toHaveValue("40rem");
  });

  it("Container max-width select dispatches onUpdate", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const container = makeNode("Container", { maxWidth: "40rem" });
    renderWithInteraction(<LayoutChips node={container} onUpdate={onUpdate} />);
    await user.selectOptions(screen.getByLabelText("Max width"), "80rem");
    expect(onUpdate).toHaveBeenCalledWith({ maxWidth: "80rem" });
  });
});
