import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpeedDial } from "../SpeedDial";

const actions = [
  { id: "add", icon: "+", label: "Add", onClick: vi.fn() },
  { id: "edit", icon: "E", label: "Edit", onClick: vi.fn() },
];

describe("SpeedDial", () => {
  it("renders trigger button", () => {
    render(<SpeedDial actions={actions} />);
    expect(screen.getByRole("button", { name: /open actions/i })).toBeInTheDocument();
  });

  it("actions are hidden by default", () => {
    render(<SpeedDial actions={actions} />);
    expect(screen.queryByRole("menuitem", { name: "Add" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("click trigger shows actions", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);

    await user.click(screen.getByRole("button", { name: /open actions/i }));
    expect(screen.getByRole("menuitem", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
  });

  it("click action calls onClick and closes", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const testActions = [{ id: "add", icon: "+", label: "Add", onClick }];
    render(<SpeedDial actions={testActions} />);

    await user.click(screen.getByRole("button", { name: /open actions/i }));
    await user.click(screen.getByRole("menuitem", { name: "Add" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem", { name: "Add" })).not.toBeInTheDocument();
  });

  it("trigger has aria-expanded reflecting state", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);

    const trigger = screen.getByRole("button", { name: /open actions/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    const openTrigger = screen.getByRole("button", { name: /close actions/i });
    expect(openTrigger).toHaveAttribute("aria-expanded", "true");
  });

  // Wave 5d P0: Enter/Space on trigger opens, ArrowDown moves to first action
  it("Enter opens actions and focuses first action", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);
    const trigger = screen.getByRole("button", { name: /open actions/i });
    trigger.focus();
    await user.keyboard("{Enter}");
    const first = screen.getByRole("menuitem", { name: "Add" });
    expect(first).toBeInTheDocument();
    expect(document.activeElement).toBe(first);
  });

  it("ArrowDown moves focus to next action and wraps to first", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);
    const trigger = screen.getByRole("button", { name: /open actions/i });
    await user.click(trigger);

    const add = screen.getByRole("menuitem", { name: "Add" });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    add.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(edit);
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(add);
  });

  it("ArrowUp moves focus backwards and wraps", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);
    await user.click(screen.getByRole("button", { name: /open actions/i }));
    const add = screen.getByRole("menuitem", { name: "Add" });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    add.focus();
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(edit);
  });

  // Wave 5d P0: Escape closes
  it("Escape closes the speed dial", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);
    await user.click(screen.getByRole("button", { name: /open actions/i }));
    expect(screen.getByRole("menuitem", { name: "Add" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("menuitem", { name: "Add" }),
    ).not.toBeInTheDocument();
  });
});

// Phase 6H — SpeedDial P1 features
describe("SpeedDial P1 additions", () => {
  it("defaults direction to 'up' and reflects it on the root", () => {
    render(<SpeedDial actions={actions} />);
    const root = screen.getByRole("group", { name: /speed dial/i });
    expect(root).toHaveAttribute("data-direction", "up");
    expect(root.className).toMatch(/wui-speed-dial--up/);
  });

  it.each([
    ["down" as const, "wui-speed-dial--down"],
    ["left" as const, "wui-speed-dial--left"],
    ["right" as const, "wui-speed-dial--right"],
  ])("direction=%s applies class %s", (direction, cls) => {
    render(<SpeedDial actions={actions} direction={direction} />);
    const root = screen.getByRole("group", { name: /speed dial/i });
    expect(root).toHaveAttribute("data-direction", direction);
    expect(root.className).toContain(cls);
  });

  it("trigger='hover' opens on pointerEnter", () => {
    render(<SpeedDial actions={actions} trigger="hover" />);
    const root = screen.getByRole("group", { name: /speed dial/i });
    expect(root).toHaveAttribute("data-state", "closed");
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-state", "open");
    expect(screen.getByRole("menuitem", { name: "Add" })).toBeInTheDocument();
  });

  it("trigger='hover' closes on pointerLeave after 200ms grace", async () => {
    vi.useFakeTimers();
    try {
      render(<SpeedDial actions={actions} trigger="hover" />);
      const root = screen.getByRole("group", { name: /speed dial/i });
      fireEvent.pointerEnter(root);
      expect(root).toHaveAttribute("data-state", "open");
      fireEvent.pointerLeave(root);
      // Still open immediately after leave
      expect(root).toHaveAttribute("data-state", "open");
      act(() => {
        vi.advanceTimersByTime(250);
      });
      expect(root).toHaveAttribute("data-state", "closed");
    } finally {
      vi.useRealTimers();
    }
  });

  it("trigger='hover' cancels close timer when pointer re-enters during grace", async () => {
    vi.useFakeTimers();
    try {
      render(<SpeedDial actions={actions} trigger="hover" />);
      const root = screen.getByRole("group", { name: /speed dial/i });
      fireEvent.pointerEnter(root);
      fireEvent.pointerLeave(root);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.pointerEnter(root);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(root).toHaveAttribute("data-state", "open");
    } finally {
      vi.useRealTimers();
    }
  });

  it("trigger='click' does not open on pointerEnter", () => {
    render(<SpeedDial actions={actions} trigger="click" />);
    const root = screen.getByRole("group", { name: /speed dial/i });
    fireEvent.pointerEnter(root);
    expect(root).toHaveAttribute("data-state", "closed");
  });

  it("outside click closes the open dial", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <SpeedDial actions={actions} />
        <button>Outside</button>
      </div>,
    );
    await user.click(screen.getByRole("button", { name: /open actions/i }));
    const root = screen.getByRole("group", { name: /speed dial/i });
    expect(root).toHaveAttribute("data-state", "open");
    fireEvent.mouseDown(document.body);
    expect(root).toHaveAttribute("data-state", "closed");
  });

  it("outside click does not close when clicking inside the dial", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);
    await user.click(screen.getByRole("button", { name: /open actions/i }));
    const root = screen.getByRole("group", { name: /speed dial/i });
    // mousedown inside the root (on the trigger button) should not close
    const trigger = screen.getByRole("button", { name: /close actions/i });
    fireEvent.mouseDown(trigger);
    expect(root).toHaveAttribute("data-state", "open");
  });

  it("each action exposes its index via --wui-speed-dial-index", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);
    await user.click(screen.getByRole("button", { name: /open actions/i }));
    const add = screen.getByRole("menuitem", { name: "Add" });
    const edit = screen.getByRole("menuitem", { name: "Edit" });
    expect(add.style.getPropertyValue("--wui-speed-dial-index")).toBe("0");
    expect(edit.style.getPropertyValue("--wui-speed-dial-index")).toBe("1");
  });

  it("each action has a tooltip with matching label", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);
    await user.click(screen.getByRole("button", { name: /open actions/i }));
    const add = screen.getByRole("menuitem", { name: "Add" });
    expect(add).toHaveAttribute("data-tooltip", "Add");
    // Hovering the action should open the Tooltip (delayDuration=0 on provider)
    fireEvent.focus(add);
    // Tooltip renders content with the action's label
    const tooltips = screen.getAllByRole("tooltip");
    expect(tooltips.some((t) => t.textContent === "Add")).toBe(true);
  });
});
