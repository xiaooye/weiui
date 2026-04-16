import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popover } from "../Popover";
import { PopoverTrigger } from "../PopoverTrigger";
import { PopoverContent } from "../PopoverContent";
import { PopoverClose } from "../PopoverClose";

function TestPopover() {
  return (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <p>Popover content</p>
        <button>Action</button>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("does not show content initially", () => {
    render(<TestPopover />);
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    render(<TestPopover />);
    await userEvent.setup().click(screen.getByText("Open"));
    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(<TestPopover />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Open"));
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("closes on PopoverClose click", async () => {
    render(<TestPopover />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Open"));
    await user.click(screen.getByText("Close"));
    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
  });

  it("has aria-haspopup on trigger", () => {
    render(<TestPopover />);
    expect(screen.getByText("Open")).toHaveAttribute("aria-haspopup");
  });

  it("trigger has aria-expanded", async () => {
    render(<TestPopover />);
    const trigger = screen.getByText("Open");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.setup().click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
