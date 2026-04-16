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
    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("click trigger shows actions", async () => {
    const user = userEvent.setup();
    render(<SpeedDial actions={actions} />);

    await user.click(screen.getByRole("button", { name: /open actions/i }));
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("click action calls onClick and closes", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const testActions = [{ id: "add", icon: "+", label: "Add", onClick }];
    render(<SpeedDial actions={testActions} />);

    await user.click(screen.getByRole("button", { name: /open actions/i }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
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
});
