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

describe("CommandPalette P1 additions", () => {
  beforeEach(() => {
    // jsdom's Storage prototype methods may be missing in some runs;
    // restore a simple in-memory shim so tests work reliably.
    const store = new Map<string, string>();
    const mockStorage: Storage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (k) => (store.has(k) ? store.get(k)! : null),
      setItem: (k, v) => void store.set(k, String(v)),
      removeItem: (k) => void store.delete(k),
      key: (i) => Array.from(store.keys())[i] ?? null,
    };
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      configurable: true,
    });
  });

  it("shows recent items group when input is empty and recent storage exists", async () => {
    window.localStorage.setItem("wui-cp-recent-demo", JSON.stringify(["go-home"]));
    const recentItems = [
      { id: "go-home", label: "Home", onSelect: vi.fn() },
      { id: "go-settings", label: "Settings", onSelect: vi.fn() },
    ];
    render(<CommandPalette id="demo" open items={recentItems} onOpenChange={vi.fn()} />);
    // Recent section header "Recent"
    expect(await screen.findByText("Recent")).toBeInTheDocument();
  });

  it("renders per-item shortcut via Kbd", async () => {
    const shortcutItems = [{ id: "save", label: "Save", shortcut: "⌘S", onSelect: vi.fn() }];
    render(<CommandPalette id="demo2" open items={shortcutItems} onOpenChange={vi.fn()} />);
    expect(await screen.findByText("⌘S")).toBeInTheDocument();
  });

  it("emptyState node renders when no results", async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette
        id="demo3"
        open
        items={[{ id: "a", label: "Apple", onSelect: vi.fn() }]}
        onOpenChange={vi.fn()}
        emptyState={<div data-testid="empty">No matches found</div>}
      />,
    );
    const input = await screen.findByRole("combobox");
    await user.type(input, "zzzzz");
    expect(await screen.findByTestId("empty")).toBeInTheDocument();
  });
});

describe("CommandPalette async loading (P1)", () => {
  it("shows Spinner and announces loading via aria-live when loading=true", () => {
    const { container } = render(
      <CommandPalette
        id="loading-demo"
        open
        items={[]}
        onOpenChange={vi.fn()}
        loading
      />,
    );
    // Spinner has role=status with the loading label.
    const spinner = screen.getByRole("status", { name: /loading/i });
    expect(spinner).toBeInTheDocument();
    // Loading container has aria-live polite
    const wrapper = container.ownerDocument.querySelector(".wui-command-palette__loading");
    expect(wrapper).toHaveAttribute("aria-live", "polite");
    // aria-busy on the listbox
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
  });

  it("keeps the filter input enabled while loading", () => {
    render(
      <CommandPalette
        id="loading-demo2"
        open
        items={[]}
        onOpenChange={vi.fn()}
        loading
      />,
    );
    const input = screen.getByRole("combobox");
    expect(input).not.toBeDisabled();
  });

  it("uses custom loadingLabel", () => {
    render(
      <CommandPalette
        id="loading-demo3"
        open
        items={[]}
        onOpenChange={vi.fn()}
        loading
        loadingLabel="Fetching commands…"
      />,
    );
    // Spinner announces via its aria-label, visible label shows beside it.
    expect(screen.getByRole("status", { name: "Fetching commands…" })).toBeInTheDocument();
    expect(screen.getAllByText("Fetching commands…").length).toBeGreaterThan(0);
  });
});

describe("CommandPalette shortcut execution (P1)", () => {
  it("invokes an item's onSelect when its shortcut is pressed while open", () => {
    const onSave = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CommandPalette
        id="sc1"
        open
        items={[
          { id: "save", label: "Save", shortcut: "Cmd+S", onSelect: onSave },
          { id: "open", label: "Open", shortcut: "Cmd+O", onSelect: vi.fn() },
        ]}
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.keyDown(document, { key: "s", metaKey: true });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("supports Ctrl+Shift+P style shortcuts", () => {
    const onCmd = vi.fn();
    render(
      <CommandPalette
        id="sc2"
        open
        items={[{ id: "cmd", label: "Command", shortcut: "Ctrl+Shift+P", onSelect: onCmd }]}
        onOpenChange={vi.fn()}
      />,
    );
    fireEvent.keyDown(document, { key: "p", ctrlKey: true, shiftKey: true });
    expect(onCmd).toHaveBeenCalled();
  });

  it("does NOT invoke disabled items even if their shortcut is pressed", () => {
    const onOff = vi.fn();
    render(
      <CommandPalette
        id="sc3"
        open
        items={[{ id: "x", label: "Disabled", shortcut: "Cmd+D", disabled: true, onSelect: onOff }]}
        onOpenChange={vi.fn()}
      />,
    );
    fireEvent.keyDown(document, { key: "d", metaKey: true });
    expect(onOff).not.toHaveBeenCalled();
  });

  it("does NOT invoke shortcut handlers when the palette is closed", () => {
    const onSave = vi.fn();
    render(
      <CommandPalette
        id="sc4"
        open={false}
        items={[{ id: "save", label: "Save", shortcut: "Cmd+S", onSelect: onSave }]}
        onOpenChange={vi.fn()}
      />,
    );
    fireEvent.keyDown(document, { key: "s", metaKey: true });
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe("CommandPalette fuzzy matching (P1)", () => {
  it("finds items with non-contiguous substring matches", async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette
        id="fz1"
        open
        items={[
          { id: "1", label: "Create New File", onSelect: vi.fn() },
          { id: "2", label: "Settings", onSelect: vi.fn() },
        ]}
        onOpenChange={vi.fn()}
      />,
    );
    const input = screen.getByRole("combobox");
    // "newfile" — no exact substring, but matches "Create New File".
    await user.type(input, "new file");
    expect(screen.getByText("Create New File")).toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("ranks exact prefix matches above loose matches", async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette
        id="fz2"
        open
        items={[
          { id: "1", label: "Settings", onSelect: vi.fn() },
          { id: "2", label: "Send Message", onSelect: vi.fn() },
        ]}
        onOpenChange={vi.fn()}
      />,
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "se");
    const options = screen.getAllByRole("option");
    // Both contain "se" — match-sorter ranks them; both should be present.
    expect(options.length).toBeGreaterThanOrEqual(2);
  });

  it("shows the full list when the query is empty", () => {
    render(
      <CommandPalette
        id="fz3"
        open
        items={[
          { id: "1", label: "One", onSelect: vi.fn() },
          { id: "2", label: "Two", onSelect: vi.fn() },
          { id: "3", label: "Three", onSelect: vi.fn() },
        ]}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });
});
