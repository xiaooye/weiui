import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "../Menu";
import { MenuTrigger } from "../MenuTrigger";
import { MenuContent } from "../MenuContent";
import { MenuItem } from "../MenuItem";
import { MenuSeparator } from "../MenuSeparator";

function TestMenu({ onSelect }: { onSelect?: (value: string) => void }) {
  return (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem onSelect={() => onSelect?.("edit")}>Edit</MenuItem>
        <MenuItem onSelect={() => onSelect?.("copy")}>Copy</MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={() => onSelect?.("delete")}>Delete</MenuItem>
      </MenuContent>
    </Menu>
  );
}

describe("Menu", () => {
  it("does not show content initially", () => {
    render(<TestMenu />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    render(<TestMenu />);
    await userEvent.setup().click(screen.getByText("Actions"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("has correct ARIA on trigger", () => {
    render(<TestMenu />);
    const trigger = screen.getByText("Actions");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape", async () => {
    render(<TestMenu />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Actions"));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("menu items have role=menuitem", async () => {
    render(<TestMenu />);
    await userEvent.setup().click(screen.getByText("Actions"));
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("calls onSelect when item clicked", async () => {
    const onSelect = vi.fn();
    render(<TestMenu onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Actions"));
    await user.click(screen.getByText("Edit"));
    expect(onSelect).toHaveBeenCalledWith("edit");
  });

  it("separator has role=separator", async () => {
    render(<TestMenu />);
    await userEvent.setup().click(screen.getByText("Actions"));
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("returns focus to trigger on close", async () => {
    render(<TestMenu />);
    const user = userEvent.setup();
    const trigger = screen.getByText("Actions");
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});
