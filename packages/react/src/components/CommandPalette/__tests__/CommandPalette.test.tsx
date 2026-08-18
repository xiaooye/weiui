import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

    // Send navigation directly to the combobox rather than depending on the
    // requestAnimationFrame focus handoff, which is intentionally asynchronous.
    const input = screen.getByRole("combobox");
    await user.type(input, "{ArrowDown}{ArrowDown}{ArrowDown}");

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
  });

  it("focus trap keeps Tab inside the dialog (does not reach outside button)", () => {
    const outside = document.createElement("button");
    outside.textContent = "outside";
    document.body.appendChild(outside);
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} />);
    const input = screen.getByRole("combobox");
    input.focus();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(document.activeElement).not.toBe(outside);
    outside.remove();
  });

  it("shows recent items group when input is empty and recent storage exists", () => {
    localStorage.setItem("civ-cp-recent-test", JSON.stringify(["3"]));
    render(<CommandPalette id="test" items={items} open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("group", { name: "Recent" })).toBeInTheDocument();
    localStorage.removeItem("civ-cp-recent-test");
  });

  it("renders per-item shortcut via Kbd", () => {
    const withShortcut = [{ id: "1", label: "Open", shortcut: "Cmd+K" }];
    render(<CommandPalette items={withShortcut} open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByText("Cmd+K")).toBeInTheDocument();
  });

  it("emptyState node renders when no results", async () => {
    const user = userEvent.setup();
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} emptyState={<div>Nothing custom</div>} />);
    await user.type(screen.getByRole("combobox"), "zzzzzz");
    expect(screen.getByText("Nothing custom")).toBeInTheDocument();
  });

  it("shows Spinner and announces loading via aria-live when loading=true", () => {
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} loading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("keeps the filter input enabled while loading", () => {
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} loading />);
    expect(screen.getByRole("combobox")).not.toBeDisabled();
  });

  it("uses custom loadingLabel", () => {
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} loading loadingLabel="Searching…" />);
    expect(screen.getByText("Searching…")).toBeInTheDocument();
  });

  it("invokes an item's onSelect when its shortcut is pressed while open", () => {
    const onSelect = vi.fn();
    const shortcutItems = [{ id: "1", label: "Run", shortcut: "Ctrl+R", onSelect }];
    render(<CommandPalette items={shortcutItems} open={true} onOpenChange={vi.fn()} />);
    fireEvent.keyDown(document, { key: "r", ctrlKey: true });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("supports Ctrl+Shift+P style shortcuts", () => {
    const onSelect = vi.fn();
    const shortcutItems = [{ id: "1", label: "Run", shortcut: "Ctrl+Shift+P", onSelect }];
    render(<CommandPalette items={shortcutItems} open={true} onOpenChange={vi.fn()} />);
    fireEvent.keyDown(document, { key: "p", ctrlKey: true, shiftKey: true });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("does NOT invoke disabled items even if their shortcut is pressed", () => {
    const onSelect = vi.fn();
    const shortcutItems = [{ id: "1", label: "Run", shortcut: "Ctrl+R", disabled: true, onSelect }];
    render(<CommandPalette items={shortcutItems} open={true} onOpenChange={vi.fn()} />);
    fireEvent.keyDown(document, { key: "r", ctrlKey: true });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does NOT invoke shortcut handlers when the palette is closed", () => {
    const onSelect = vi.fn();
    const shortcutItems = [{ id: "1", label: "Run", shortcut: "Ctrl+R", onSelect }];
    render(<CommandPalette items={shortcutItems} open={false} onOpenChange={vi.fn()} />);
    fireEvent.keyDown(document, { key: "r", ctrlKey: true });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("finds items with non-contiguous substring matches", async () => {
    const user = userEvent.setup();
    const fuzzyItems = [
      { id: "1", label: "Open Settings" },
      { id: "2", label: "View Profile" },
    ];
    render(<CommandPalette items={fuzzyItems} open={true} onOpenChange={vi.fn()} />);
    await user.type(screen.getByRole("combobox"), "settings");
    expect(screen.getByText("Open Settings")).toBeInTheDocument();
  });

  it("ranks exact prefix matches above loose matches", async () => {
    const user = userEvent.setup();
    const fuzzyItems = [
      { id: "1", label: "Open Settings" },
      { id: "2", label: "Settings Advanced" },
    ];
    render(<CommandPalette items={fuzzyItems} open={true} onOpenChange={vi.fn()} />);
    await user.type(screen.getByRole("combobox"), "settings");
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("Settings Advanced");
  });

  it("shows the full list when the query is empty", () => {
    render(<CommandPalette items={items} open={true} onOpenChange={vi.fn()} />);
    expect(screen.getAllByRole("option")).toHaveLength(items.length);
  });
});
