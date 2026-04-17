import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from "../Menu";

function TestMenu({ onSelect }: { onSelect?: (value: string) => void } = {}) {
  return (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem onSelect={() => onSelect?.("edit")}>Edit</MenuItem>
        <MenuItem disabled onSelect={() => onSelect?.("copy")}>Copy</MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={() => onSelect?.("delete")}>Delete</MenuItem>
        <MenuItem onSelect={() => onSelect?.("export")}>Export</MenuItem>
      </MenuContent>
    </Menu>
  );
}

describe("Menu", () => {
  it("opens on trigger click and renders content to document.body via Portal", async () => {
    const { container } = render(<TestMenu />);
    await userEvent.setup().click(screen.getByText("Actions"));
    const menu = screen.getByRole("menu");
    expect(container.contains(menu)).toBe(false);
    expect(document.body.contains(menu)).toBe(true);
  });

  it("applies floating styles (position: absolute) on MenuContent", async () => {
    render(<TestMenu />);
    await userEvent.setup().click(screen.getByText("Actions"));
    expect(screen.getByRole("menu").style.position).toBe("absolute");
  });

  it("skips disabled items during ArrowDown navigation", async () => {
    render(<TestMenu />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Actions"));
    // First enabled item is Edit (index 0), focused on open
    expect(screen.getByText("Edit")).toHaveFocus();
    // ArrowDown should skip disabled "Copy" (index 1) and land on "Delete" (index 2)
    await user.keyboard("{ArrowDown}");
    expect(screen.getByText("Delete")).toHaveFocus();
    // ArrowDown again -> Export (index 3)
    await user.keyboard("{ArrowDown}");
    expect(screen.getByText("Export")).toHaveFocus();
    // Wrap back to Edit (skipping Copy)
    await user.keyboard("{ArrowDown}");
    expect(screen.getByText("Edit")).toHaveFocus();
  });

  it("skips disabled items when ArrowUp wraps around", async () => {
    render(<TestMenu />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Actions"));
    // Start at Edit, ArrowUp wraps to Export (skip Copy)
    await user.keyboard("{ArrowUp}");
    expect(screen.getByText("Export")).toHaveFocus();
  });

  it("disabled MenuItem does not fire onSelect on click", async () => {
    const onSelect = vi.fn();
    render(<TestMenu onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Actions"));
    await user.click(screen.getByText("Copy"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("type-ahead focuses the first matching item", async () => {
    render(<TestMenu />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Actions"));
    // Type 'd' — matches Delete
    await user.keyboard("d");
    expect(screen.getByText("Delete")).toHaveFocus();
    // Buffer accumulates — typing 'ex' while buffer is still 'd' makes 'dex' which matches nothing
    // Wait >500ms to clear buffer, then type 'ex' to match Export
    await new Promise((r) => setTimeout(r, 600));
    await user.keyboard("ex");
    expect(screen.getByText("Export")).toHaveFocus();
  });

  it("items have role=menuitem and aria-disabled on disabled item", async () => {
    render(<TestMenu />);
    await userEvent.setup().click(screen.getByText("Actions"));
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(4);
    const copy = items.find((el) => el.textContent === "Copy")!;
    expect(copy).toHaveAttribute("aria-disabled", "true");
  });
});
