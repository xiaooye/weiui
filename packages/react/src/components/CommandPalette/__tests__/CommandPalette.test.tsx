import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "../CommandPalette";

const fn1 = vi.fn();
const fn2 = vi.fn();
const fn3 = vi.fn();

const items = [
  { id: "1", label: "Home", group: "Navigation", onSelect: fn1 },
  { id: "2", label: "Settings", group: "Navigation", onSelect: fn2 },
  { id: "3", label: "Profile", group: "Account", onSelect: fn3 },
  { id: "4", label: "Disabled Item", group: "Account", disabled: true, onSelect: vi.fn() },
];

describe("CommandPalette", () => {
  beforeEach(() => {
    fn1.mockClear();
    fn2.mockClear();
    fn3.mockClear();
  });

  it("is not visible when open=false", () => {
    render(<CommandPalette items={items} open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is visible when open=true", () => {
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("filters items based on search input", async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "Home");

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("navigates items with ArrowDown and ArrowUp", async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} />);

    const input = screen.getByRole("combobox");
    // Default highlight is index 0 (Home). ArrowDown on the input moves to index 1.
    await user.type(input, "{ArrowDown}");

    const secondItem = screen.getByText("Settings").closest("[role='option']")!;
    expect(secondItem).toHaveAttribute("data-highlighted", "true");

    await user.type(input, "{ArrowUp}");
    const firstItem = screen.getByText("Home").closest("[role='option']")!;
    expect(firstItem).toHaveAttribute("data-highlighted", "true");
  });

  it("selects highlighted item on Enter and calls onSelect", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CommandPalette items={items} open={true} onOpenChange={onOpenChange} />);

    // First non-disabled item (Home, index 0) is highlighted by default.
    // Fire Enter on the input to trigger selection.
    const input = screen.getByRole("combobox");
    await user.type(input, "{Enter}");

    expect(fn1).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange(false) on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CommandPalette items={items} open={true} onOpenChange={onOpenChange} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("groups items by group label", () => {
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("skips disabled items during keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} />);

    // Navigate down past Profile (index 2) — next would be disabled item (index 3), should stay at 2
    await user.keyboard("{ArrowDown}"); // index 1 (Settings)
    await user.keyboard("{ArrowDown}"); // index 2 (Profile)
    await user.keyboard("{ArrowDown}"); // should skip disabled, stays at 2

    const profileItem = screen.getByText("Profile").closest("[role='option']")!;
    expect(profileItem).toHaveAttribute("data-highlighted", "true");
  });

  it("shows the search input with placeholder", () => {
    render(
      <CommandPalette items={items} open={true} onOpenChange={vi.fn()} placeholder="Search commands..." />,
    );
    expect(screen.getByPlaceholderText("Search commands...")).toBeInTheDocument();
  });

  it("renders content to document.body via Portal", () => {
    const { container } = render(
      <CommandPalette items={items} open={true} onOpenChange={vi.fn()} />,
    );
    const dialog = screen.getByRole("dialog");
    expect(container.contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
  });

  it("renders per-item icon when provided", () => {
    const withIcons = [
      { id: "1", label: "Home", icon: <span data-testid="icon-home">H</span>, onSelect: vi.fn() },
      { id: "2", label: "Search", onSelect: vi.fn() },
    ];
    render(<CommandPalette items={withIcons} open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByTestId("icon-home")).toBeInTheDocument();
    // item-icon wrapper has aria-hidden
    const iconSpan = screen.getByTestId("icon-home").parentElement!;
    expect(iconSpan).toHaveAttribute("aria-hidden", "true");
    expect(iconSpan).toHaveClass("wui-command__item-icon");
  });

  it("focus trap keeps Tab inside the dialog (does not reach outside button)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Outside</button>
        <CommandPalette items={items} open={true} onOpenChange={vi.fn()} />
      </>,
    );
    // Input is auto-focused on open. Tab should cycle within the dialog,
    // not land on the external "Outside" button.
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByText("Outside")).not.toHaveFocus();
  });
});
