import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
