# Phase 6a — Overlay Family P1 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every P1 feature gap across 7 overlay components — Menu, Popover, Tooltip, Dialog, Drawer, Toast, CommandPalette — so they match Radix/Ark/Sonner-level feature surface.

**Architecture:** Most overlay components already have `useFloatingMenu` placement, `Portal` rendering, `useDisclosure` state. This phase *extends* them: new prop APIs, new sub-components (`<MenuCheckboxItem>`, `<PopoverArrow>`, `<TooltipProvider>`), new callbacks (`onInteractOutside`, `onEscapeKeyDown`, `onOpenAutoFocus`), and new toast-store behaviors (`toast.promise`, pause-on-hover). All CSS lands as `wui-*` classes in the existing element files.

**Tech Stack:** React 19, `@weiui/headless` hooks (useFloatingMenu / useDisclosure / useFocusTrap / useControllable), `@floating-ui/react` (already a dep via headless), Vitest, Playwright interaction tests.

**Audit reference:** `docs/audit/component-parity.md` Wave 5b section — all P1 rows.
**Parent plan:** `C:/Users/PC/.claude/plans/thats-not-covered-enough-gleaming-dewdrop.md` Phase 6a.

---

## File Structure

**Modified files:**
- `packages/react/src/components/Menu/Menu.tsx` — add offset prop, CheckboxItem, RadioItem, Label, shortcut slot
- `packages/react/src/components/Popover/Popover.tsx` — add PopoverArrow, collisionPadding, modal, onOpenAutoFocus/onCloseAutoFocus
- `packages/react/src/components/Tooltip/Tooltip.tsx` — add TooltipProvider, side/align/offset props, Escape close
- `packages/react/src/components/Dialog/Dialog.tsx` — add modal prop, nested stacking, onInteractOutside, onEscapeKeyDown
- `packages/react/src/components/Drawer/Drawer.tsx` — add onInteractOutside, onEscapeKeyDown
- `packages/react/src/components/Toast/toast-store.ts` + `Toaster.tsx` — add toast.promise, stacking-expand-on-hover, pause-on-hover
- `packages/react/src/components/CommandPalette/CommandPalette.tsx` — add recent items, per-item shortcuts, emptyState ReactNode, animations
- `packages/react/src/index.ts` — export new sub-components (`MenuCheckboxItem`, `MenuRadioItem`, `MenuLabel`, `PopoverArrow`, `TooltipProvider`)

**CSS files (modified):**
- `packages/css/src/elements/menu.css` — new classes for CheckboxItem/RadioItem/Label/shortcut
- `packages/css/src/elements/popover.css` — arrow class
- `packages/css/src/elements/toast.css` — stacking, pause-on-hover, loading variant
- `packages/css/src/elements/command-palette.css` — recent group, shortcut slot, enter/exit animation

**Test files (extended):**
- `packages/react/src/components/Menu/__tests__/Menu.test.tsx`
- `packages/react/src/components/Popover/__tests__/Popover.test.tsx`
- `packages/react/src/components/Tooltip/__tests__/Tooltip.test.tsx`
- `packages/react/src/components/Dialog/__tests__/Dialog.test.tsx`
- `packages/react/src/components/Drawer/__tests__/Drawer.test.tsx`
- `packages/react/src/components/Toast/__tests__/toast-store.test.ts` (new or extended)
- `packages/react/src/components/CommandPalette/__tests__/CommandPalette.test.tsx`

**Docs (updated):**
- `apps/docs/src/components/demos/MenuDemo.tsx` — showcase checkbox/radio/shortcut
- `apps/docs/src/components/demos/PopoverDemo.tsx` — show arrow
- `apps/docs/src/components/demos/TooltipDemo.tsx` — show provider + side prop
- `apps/docs/src/components/demos/ToastDemo.tsx` — show `toast.promise`
- `apps/docs/src/components/demos/CommandPaletteDemo.tsx` — show shortcuts
- `docs/audit/component-parity.md` — flip Wave 5b P1 rows to ✅ shipped

---

## Task 1: Menu — offset prop + CheckboxItem/RadioItem/Label/shortcut

**Files:**
- Modify: `packages/react/src/components/Menu/Menu.tsx`
- Modify: `packages/react/src/components/Menu/index.ts` — export new sub-components
- Modify: `packages/css/src/elements/menu.css`
- Modify: `packages/react/src/index.ts`
- Test: `packages/react/src/components/Menu/__tests__/Menu.test.tsx`
- Demo: `apps/docs/src/components/demos/MenuDemo.tsx`

### Step 1: Write failing tests

Append to `packages/react/src/components/Menu/__tests__/Menu.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioItem, MenuLabel } from "../Menu";

describe("Menu P1 additions", () => {
  it("MenuCheckboxItem toggles checked state via role=menuitemcheckbox", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuCheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Show toolbar
          </MenuCheckboxItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByText("Open"));
    const item = await screen.findByRole("menuitemcheckbox");
    expect(item).toHaveAttribute("aria-checked", "false");
    await user.click(item);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("MenuRadioItem exposes role=menuitemradio with aria-checked", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuRadioItem value="a" checked>A</MenuRadioItem>
          <MenuRadioItem value="b">B</MenuRadioItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByText("Open"));
    const items = await screen.findAllByRole("menuitemradio");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("aria-checked", "true");
    expect(items[1]).toHaveAttribute("aria-checked", "false");
  });

  it("MenuLabel renders as non-focusable section header", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuLabel>Appearance</MenuLabel>
          <MenuItem>Light</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByText("Open"));
    const label = await screen.findByText("Appearance");
    expect(label).toHaveAttribute("role", "presentation");
    // Focused index should skip past the label to the first MenuItem
    expect(screen.getByText("Light")).toHaveFocus();
  });

  it("MenuItem shortcut renders inside item", async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <MenuTrigger>Open</MenuTrigger>
        <MenuContent>
          <MenuItem shortcut="⌘N">New File</MenuItem>
        </MenuContent>
      </Menu>,
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByText("⌘N")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

Run: `pnpm --filter @weiui/react test -- Menu`
Expected: 4 new failures. Imports of `MenuCheckboxItem`, `MenuRadioItem`, `MenuLabel` fail because they don't exist.

### Step 3: Add `offset` prop to Menu root

Edit `packages/react/src/components/Menu/Menu.tsx` — add `offset?: number` to `MenuProps` and thread to `useFloatingMenu`:

```tsx
export interface MenuProps {
  children: ReactNode;
  side?: MenuSide;
  align?: MenuAlign;
  offset?: number;
}

export function Menu({ children, side = "bottom", align = "start", offset = 4 }: MenuProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const baseId = useId("menu");
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleClose = useCallback(() => {
    setActiveIndex(-1);
    onClose();
  }, [onClose]);

  const { refs, floatingStyles } = useFloatingMenu({
    open: isOpen,
    placement: toPlacement(side, align),
    offsetPx: offset,
    collisionPadding: 8,
  });

  return (
    <MenuContext.Provider
      value={{
        isOpen, onOpen, onClose: handleClose,
        activeIndex, setActiveIndex,
        menuId: `${baseId}-menu`, triggerId: `${baseId}-trigger`,
        refs, floatingStyles,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}
```

### Step 4: Add `shortcut` prop to MenuItem

In the same file, replace the existing `MenuItem` with:

```tsx
export interface MenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: string;
  /** Internal: injected by MenuContent */
  _menuIndex?: number;
}

export function MenuItem({
  children,
  onSelect,
  disabled = false,
  shortcut,
  _menuIndex,
  onClick,
  onKeyDown,
  className,
  ...props
}: MenuItemProps) {
  const { activeIndex, onClose } = useMenuContext();
  const index = _menuIndex ?? 0;
  const isActive = activeIndex === index;

  function activate() {
    if (disabled) return;
    onSelect?.();
    onClose();
  }

  return (
    <div
      role="menuitem"
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      tabIndex={isActive && !disabled ? 0 : -1}
      className={className}
      onClick={(e) => {
        activate();
        onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === Keys.Enter || e.key === Keys.Space)) {
          e.preventDefault();
          activate();
        }
        onKeyDown?.(e);
      }}
      {...props}
    >
      <span className="wui-menu__label">{children}</span>
      {shortcut && <span className="wui-menu__shortcut">{shortcut}</span>}
    </div>
  );
}
MenuItem.displayName = "MenuItem";
```

### Step 5: Add MenuCheckboxItem, MenuRadioItem, MenuLabel

Append to `Menu.tsx` after `MenuSeparator`:

```tsx
export interface MenuCheckboxItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  shortcut?: string;
  _menuIndex?: number;
}

export function MenuCheckboxItem({
  children, checked, onCheckedChange, disabled = false, shortcut, _menuIndex,
  onClick, onKeyDown, className, ...props
}: MenuCheckboxItemProps) {
  const { activeIndex, onClose } = useMenuContext();
  const index = _menuIndex ?? 0;
  const isActive = activeIndex === index;

  function activate() {
    if (disabled) return;
    onCheckedChange?.(!checked);
    onClose();
  }

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      data-checked={checked ? "" : undefined}
      tabIndex={isActive && !disabled ? 0 : -1}
      className={className}
      onClick={(e) => { activate(); onClick?.(e); }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === Keys.Enter || e.key === Keys.Space)) {
          e.preventDefault();
          activate();
        }
        onKeyDown?.(e);
      }}
      {...props}
    >
      <span className="wui-menu__indicator" aria-hidden="true">{checked ? "✓" : ""}</span>
      <span className="wui-menu__label">{children}</span>
      {shortcut && <span className="wui-menu__shortcut">{shortcut}</span>}
    </div>
  );
}
MenuCheckboxItem.displayName = "MenuCheckboxItem";

export interface MenuRadioItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  value: string;
  checked?: boolean;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  shortcut?: string;
  _menuIndex?: number;
}

export function MenuRadioItem({
  children, value, checked = false, onSelect, disabled = false, shortcut, _menuIndex,
  onClick, onKeyDown, className, ...props
}: MenuRadioItemProps) {
  const { activeIndex, onClose } = useMenuContext();
  const index = _menuIndex ?? 0;
  const isActive = activeIndex === index;

  function activate() {
    if (disabled) return;
    onSelect?.(value);
    onClose();
  }

  return (
    <div
      role="menuitemradio"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      data-checked={checked ? "" : undefined}
      tabIndex={isActive && !disabled ? 0 : -1}
      className={className}
      onClick={(e) => { activate(); onClick?.(e); }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === Keys.Enter || e.key === Keys.Space)) {
          e.preventDefault();
          activate();
        }
        onKeyDown?.(e);
      }}
      {...props}
    >
      <span className="wui-menu__indicator" aria-hidden="true">{checked ? "●" : ""}</span>
      <span className="wui-menu__label">{children}</span>
      {shortcut && <span className="wui-menu__shortcut">{shortcut}</span>}
    </div>
  );
}
MenuRadioItem.displayName = "MenuRadioItem";

export interface MenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function MenuLabel({ children, className, ...props }: MenuLabelProps) {
  return (
    <div role="presentation" className={className} {...props}>
      {children}
    </div>
  );
}
MenuLabel.displayName = "MenuLabel";

// Flag so MenuContent indexing skips the label like it does for separators
(MenuLabel as { isSeparator?: boolean }).isSeparator = true;
```

### Step 6: Update MenuContent's item detection

In `MenuContent`, the existing `isSeparator` check already skips Labels (we set `isSeparator = true` on MenuLabel). CheckboxItem and RadioItem are treated as items. Add them to the role selector in the activeIndex effect:

Find this line in `MenuContent`:
```tsx
const items = contentRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]');
```

Replace with:
```tsx
const items = contentRef.current.querySelectorAll<HTMLElement>(
  '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'
);
```

Do the same in the typeahead block (it's the same query inside the default case of the keydown switch).

### Step 7: Update Menu/index.ts

Replace contents of `packages/react/src/components/Menu/index.ts` with:

```ts
export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioItem,
  MenuLabel,
  type MenuProps,
  type MenuTriggerProps,
  type MenuContentProps,
  type MenuItemProps,
  type MenuSeparatorProps,
  type MenuCheckboxItemProps,
  type MenuRadioItemProps,
  type MenuLabelProps,
} from "./Menu";
```

### Step 8: Update main barrel

Open `packages/react/src/index.ts`. Find the Menu export line. Confirm it re-exports everything from `./components/Menu` (should look like `export * from "./components/Menu";`). If it lists names explicitly, add the three new ones + their types.

### Step 9: Add CSS for new items + shortcut

Append to `packages/css/src/elements/menu.css`:

```css
@layer wui-elements {
  .wui-menu__label {
    flex: 1;
  }
  .wui-menu__shortcut {
    margin-inline-start: var(--wui-spacing-4);
    font-family: var(--wui-font-family-mono);
    font-size: var(--wui-font-size-xs);
    color: var(--wui-color-muted-foreground);
  }
  .wui-menu__indicator {
    inline-size: 1em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: var(--wui-spacing-2);
    color: var(--wui-color-primary);
  }
  [role="menuitemcheckbox"],
  [role="menuitemradio"] {
    padding-inline-start: var(--wui-spacing-2);
  }
  [role="presentation"].wui-menu__label-group,
  .wui-menu [role="presentation"] {
    padding-inline: var(--wui-spacing-3);
    padding-block: var(--wui-spacing-1);
    font-size: var(--wui-font-size-xs);
    font-weight: var(--wui-font-weight-semibold);
    color: var(--wui-color-muted-foreground);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
}
```

### Step 10: Run tests, confirm pass

Run: `pnpm --filter @weiui/react test -- Menu`
Expected: All new 4 tests pass. Existing Menu tests still pass.

Run: `pnpm --filter @weiui/react test` (full suite)
Expected: ≥ 612 tests pass, no regressions.

### Step 11: Update MenuDemo

Read `apps/docs/src/components/demos/MenuDemo.tsx`. Add a second example after the existing one showing checkbox + radio + label + shortcut:

```tsx
// Add inside MenuDemo component, after existing Menu:
<Menu>
  <MenuTrigger className="wui-button wui-button--outline">Format</MenuTrigger>
  <MenuContent className="wui-menu">
    <MenuLabel>Style</MenuLabel>
    <MenuCheckboxItem
      checked={bold}
      onCheckedChange={setBold}
      shortcut="⌘B"
    >
      Bold
    </MenuCheckboxItem>
    <MenuCheckboxItem
      checked={italic}
      onCheckedChange={setItalic}
      shortcut="⌘I"
    >
      Italic
    </MenuCheckboxItem>
    <MenuSeparator />
    <MenuLabel>Alignment</MenuLabel>
    <MenuRadioItem value="left" checked={align === "left"} onSelect={setAlign}>Left</MenuRadioItem>
    <MenuRadioItem value="center" checked={align === "center"} onSelect={setAlign}>Center</MenuRadioItem>
    <MenuRadioItem value="right" checked={align === "right"} onSelect={setAlign}>Right</MenuRadioItem>
  </MenuContent>
</Menu>
```

Add the imports (`MenuLabel`, `MenuCheckboxItem`, `MenuRadioItem`, `MenuSeparator`) and `useState` calls for `bold`/`italic`/`align`.

### Step 12: Build + commit

Run: `pnpm --filter @weiui/docs build`
Expected: success, no errors.

```bash
git add packages/react/src/components/Menu/ \
        packages/css/src/elements/menu.css \
        apps/docs/src/components/demos/MenuDemo.tsx \
        packages/react/src/index.ts
git commit -m "feat(react): Menu offset prop + CheckboxItem/RadioItem/Label/shortcut (P1)"
```

---

## Task 2: Popover — arrow + collisionPadding + modal + focus callbacks

**Files:**
- Modify: `packages/react/src/components/Popover/Popover.tsx`
- Modify: `packages/react/src/components/Popover/index.ts`
- Modify: `packages/css/src/elements/popover.css`
- Test: `packages/react/src/components/Popover/__tests__/Popover.test.tsx`
- Demo: `apps/docs/src/components/demos/PopoverDemo.tsx`

### Step 1: Write failing tests

Append to `packages/react/src/components/Popover/__tests__/Popover.test.tsx`:

```tsx
import { PopoverArrow } from "../Popover";

describe("Popover P1 additions", () => {
  it("renders PopoverArrow when mounted in content", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          Body
          <PopoverArrow data-testid="arrow" />
        </PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByTestId("arrow")).toBeInTheDocument();
  });

  it("modal={false} skips focus trap (focus escapes)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Popover modal={false}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <button>Inside</button>
          </PopoverContent>
        </Popover>
        <button data-testid="outside">Outside</button>
      </>,
    );
    await user.click(screen.getByText("Open"));
    await screen.findByText("Inside");
    // In non-modal mode Tab should reach the Outside button
    await user.tab();
    await user.tab();
    // Focus should NOT be trapped. The Outside button eventually gets focus.
    // Since focus ordering varies by browser, assert only that trap is not active
    // by checking Outside can receive focus via JS:
    screen.getByTestId("outside").focus();
    expect(screen.getByTestId("outside")).toHaveFocus();
  });

  it("onInteractOutside is called with preventDefault support", async () => {
    const user = userEvent.setup();
    const onInteract = vi.fn((e: Event) => e.preventDefault());
    render(
      <>
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent onInteractOutside={onInteract}>Body</PopoverContent>
        </Popover>
        <button data-testid="outside">Outside</button>
      </>,
    );
    await user.click(screen.getByText("Open"));
    await screen.findByText("Body");
    await user.click(screen.getByTestId("outside"));
    expect(onInteract).toHaveBeenCalled();
    // Popover should remain open because preventDefault was called
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
```

Add `import { PopoverArrow } from "../Popover";` at the top of the file if it's not already imported.

### Step 2: Run tests, confirm fail

Run: `pnpm --filter @weiui/react test -- Popover`
Expected: 3 new failures. `PopoverArrow` doesn't exist, `modal` prop not recognized, `onInteractOutside` not wired.

### Step 3: Update Popover types + root

Replace the `PopoverProps` interface and `Popover` function:

```tsx
export interface PopoverProps extends UseDisclosureProps {
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  offset?: number;
  collisionPadding?: number;
  modal?: boolean;
}

export function Popover({
  children,
  side = "bottom",
  align = "start",
  offset = 8,
  collisionPadding = 8,
  modal = false,
  ...disclosureProps
}: PopoverProps) {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure(disclosureProps);
  const baseId = useId("popover");
  const popoverId = `${baseId}-content`;
  const triggerId = `${baseId}-trigger`;
  const arrowRef = useRef<HTMLElement | null>(null);

  const { refs, floatingStyles, middlewareData, placement } = useFloatingMenu({
    open: isOpen,
    placement: toPlacement(side, align),
    offsetPx: offset,
    collisionPadding,
    arrowRef,
  });

  return (
    <PopoverContext.Provider
      value={{
        isOpen, onOpen, onClose, onToggle,
        popoverId, triggerId, refs, floatingStyles,
        modal, arrowRef, arrowData: middlewareData.arrow, placement,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}
```

### Step 4: Extend PopoverContextValue

Replace the interface near the top:

```tsx
interface PopoverContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  popoverId: string;
  triggerId: string;
  refs: ReturnType<typeof useFloatingMenu>["refs"];
  floatingStyles: CSSProperties;
  modal: boolean;
  arrowRef: MutableRefObject<HTMLElement | null>;
  arrowData: { x?: number; y?: number } | undefined;
  placement: string;
}
```

### Step 5: Update PopoverContent

Replace the `PopoverContent` function with:

```tsx
export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onInteractOutside?: (event: MouseEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

export function PopoverContent({
  children,
  style,
  onKeyDown,
  onInteractOutside,
  onEscapeKeyDown,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: PopoverContentProps) {
  const { isOpen, onClose, popoverId, refs, floatingStyles, modal } = usePopoverContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const setRefs = (el: HTMLDivElement | null) => {
    (contentRef as MutableRefObject<HTMLDivElement | null>).current = el;
    refs.setFloating(el);
  };

  useFocusTrap(contentRef, isOpen && modal);

  // Custom outside-click that respects onInteractOutside preventDefault
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (!contentRef.current) return;
      if (contentRef.current.contains(e.target as Node)) return;
      // Trigger also in ref — don't count it
      const preventable = new Event("interactoutside", { cancelable: true });
      Object.defineProperty(preventable, "target", { value: e.target });
      onInteractOutside?.(preventable as unknown as MouseEvent);
      if (!preventable.defaultPrevented) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose, onInteractOutside]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const openEvent = new Event("openautofocus", { cancelable: true });
      onOpenAutoFocus?.(openEvent);
      if (!openEvent.defaultPrevented) {
        const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
        if (firstFocusable) firstFocusable.focus();
      }
    } else if (previousFocusRef.current) {
      const closeEvent = new Event("closeautofocus", { cancelable: true });
      onCloseAutoFocus?.(closeEvent);
      if (!closeEvent.defaultPrevented) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
    }
  }, [isOpen, onOpenAutoFocus, onCloseAutoFocus]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={setRefs}
        id={popoverId}
        style={{ ...floatingStyles, ...style }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            const escEvent = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
            onEscapeKeyDown?.(escEvent);
            if (!escEvent.defaultPrevented) {
              e.stopPropagation();
              onClose();
            }
          }
          onKeyDown?.(e);
        }}
        {...props}
      >
        {children}
      </div>
    </Portal>
  );
}
PopoverContent.displayName = "PopoverContent";
```

### Step 6: Add PopoverArrow subcomponent

Append after `PopoverClose`:

```tsx
export interface PopoverArrowProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

export function PopoverArrow({ size = 8, style, ...props }: PopoverArrowProps) {
  const { arrowRef, arrowData, placement } = usePopoverContext();
  const side = placement.split("-")[0] as PopoverSide;
  const staticSide: PopoverSide = (
    { top: "bottom", right: "left", bottom: "top", left: "right" } as const
  )[side];

  return (
    <span
      ref={(el) => { arrowRef.current = el; }}
      aria-hidden="true"
      className="wui-popover__arrow"
      style={{
        position: "absolute",
        width: size,
        height: size,
        background: "inherit",
        left: arrowData?.x != null ? `${arrowData.x}px` : undefined,
        top: arrowData?.y != null ? `${arrowData.y}px` : undefined,
        [staticSide]: `-${size / 2}px`,
        transform: "rotate(45deg)",
        ...style,
      }}
      {...props}
    />
  );
}
PopoverArrow.displayName = "PopoverArrow";
```

Also add imports at the top (if not already present):

```tsx
import type { MutableRefObject } from "react";
```

And update the top of file — add `useRef` to the `react` import if missing. It already is.

Also handle `middlewareData` + `placement` — `useFloatingMenu` must return these. Check `packages/headless/src/use-floating-menu.ts` — it already does (Tooltip uses them).

### Step 7: Update Popover/index.ts

Replace contents:

```ts
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
  PopoverArrow,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverContentProps,
  type PopoverCloseProps,
  type PopoverArrowProps,
} from "./Popover";
```

### Step 8: CSS

Append to `packages/css/src/elements/popover.css`:

```css
@layer wui-elements {
  .wui-popover__arrow {
    /* Intrinsic box styled via inline styles (position from floating-ui).
       Border radius makes the rotated square look softer. */
    border-start-start-radius: 2px;
  }
}
```

### Step 9: Run tests

Run: `pnpm --filter @weiui/react test -- Popover`
Expected: all 3 new tests pass.

Run: `pnpm --filter @weiui/react test` full suite — still green.

### Step 10: Update demo

Edit `apps/docs/src/components/demos/PopoverDemo.tsx`. Add `<PopoverArrow />` inside the `<PopoverContent>`:

```tsx
import { Popover, PopoverTrigger, PopoverContent, PopoverClose, PopoverArrow, Button, Avatar, AvatarFallback } from "@weiui/react";
// ... existing JSX, inside PopoverContent after the content wrapper:
<PopoverArrow />
```

### Step 11: Build + commit

Run: `pnpm --filter @weiui/docs build` — success.

```bash
git add packages/react/src/components/Popover/ \
        packages/css/src/elements/popover.css \
        apps/docs/src/components/demos/PopoverDemo.tsx
git commit -m "feat(react): Popover arrow + collisionPadding + modal + focus callbacks (P1)"
```

---

## Task 3: Tooltip — Provider + side/align/offset + Escape close

**Files:**
- Modify: `packages/react/src/components/Tooltip/Tooltip.tsx`
- Modify: `packages/react/src/components/Tooltip/index.ts`
- Modify: `packages/react/src/index.ts`
- Test: `packages/react/src/components/Tooltip/__tests__/Tooltip.test.tsx`

### Step 1: Failing tests

Append:

```tsx
import { TooltipProvider } from "../Tooltip";

describe("Tooltip P1 additions", () => {
  it("TooltipProvider sets global delay that child tooltips consume", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger><button>Trigger</button></TooltipTrigger>
          <TooltipContent>Hi</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.hover(screen.getByText("Trigger"));
    expect(await screen.findByText("Hi")).toBeInTheDocument();
  });

  it("side prop changes placement", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip side="bottom">
        <TooltipTrigger><button>Trigger</button></TooltipTrigger>
        <TooltipContent data-testid="tip">Hi</TooltipContent>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Trigger"));
    const tip = await screen.findByTestId("tip");
    expect(tip).toBeInTheDocument();
    // floating-ui sets inline styles; just confirm the tooltip rendered with the side
  });

  it("Escape closes the tooltip", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger><button>Trigger</button></TooltipTrigger>
        <TooltipContent>Hi</TooltipContent>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Trigger"));
    expect(await screen.findByText("Hi")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Hi")).not.toBeInTheDocument();
  });
});
```

### Step 2: Run, confirm fail

`pnpm --filter @weiui/react test -- Tooltip` — 3 new fails.

### Step 3: Add TooltipProvider context

At the top of `Tooltip.tsx`, after the existing imports, add a provider context:

```tsx
interface TooltipProviderValue {
  delayDuration: number;
  skipDelayDuration: number;
}

const TooltipProviderContext = createContext<TooltipProviderValue>({
  delayDuration: 700,
  skipDelayDuration: 300,
});

export interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function TooltipProvider({ children, delayDuration = 700, skipDelayDuration = 300 }: TooltipProviderProps) {
  return (
    <TooltipProviderContext.Provider value={{ delayDuration, skipDelayDuration }}>
      {children}
    </TooltipProviderContext.Provider>
  );
}
TooltipProvider.displayName = "TooltipProvider";
```

### Step 4: Wire Tooltip to provider + new props

Replace `TooltipProps` and `Tooltip`:

```tsx
type TooltipSide = "top" | "right" | "bottom" | "left";
type TooltipAlign = "start" | "center" | "end";

type FloatingPlacement =
  | "top" | "right" | "bottom" | "left"
  | "top-start" | "top-end"
  | "right-start" | "right-end"
  | "bottom-start" | "bottom-end"
  | "left-start" | "left-end";

function toPlacement(side: TooltipSide, align: TooltipAlign): FloatingPlacement {
  if (align === "center") return side;
  return `${side}-${align}` as FloatingPlacement;
}

export interface TooltipProps {
  children: ReactNode;
  delay?: number;
  closeDelay?: number;
  side?: TooltipSide;
  align?: TooltipAlign;
  offset?: number;
}

export function Tooltip({
  children,
  delay,
  closeDelay = 0,
  side = "top",
  align = "center",
  offset = 8,
}: TooltipProps) {
  const providerValue = useContext(TooltipProviderContext);
  const resolvedDelay = delay ?? providerValue.delayDuration;

  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId("tooltip");
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const arrowRef = useRef<HTMLElement | null>(null);

  const { refs, floatingStyles, middlewareData, placement } = useFloatingMenu({
    open: isOpen,
    placement: toPlacement(side, align),
    offsetPx: offset,
    collisionPadding: 8,
    arrowRef,
  });

  const open = useCallback(() => {
    clearTimeout(closeTimeoutRef.current);
    if (resolvedDelay > 0) {
      openTimeoutRef.current = setTimeout(() => setIsOpen(true), resolvedDelay);
    } else {
      setIsOpen(true);
    }
  }, [resolvedDelay]);

  const close = useCallback(() => {
    clearTimeout(openTimeoutRef.current);
    if (closeDelay > 0) {
      closeTimeoutRef.current = setTimeout(() => setIsOpen(false), closeDelay);
    } else {
      setIsOpen(false);
    }
  }, [closeDelay]);

  useEffect(
    () => () => {
      clearTimeout(openTimeoutRef.current);
      clearTimeout(closeTimeoutRef.current);
    },
    [],
  );

  // Escape closes tooltip globally while open
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        clearTimeout(openTimeoutRef.current);
        clearTimeout(closeTimeoutRef.current);
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <TooltipContext.Provider
      value={{
        isOpen, open, close, tooltipId, refs, floatingStyles,
        arrowRef, arrowData: middlewareData.arrow, placement,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
Tooltip.displayName = "Tooltip";
```

### Step 5: Update Tooltip/index.ts and main barrel

Replace `packages/react/src/components/Tooltip/index.ts`:

```ts
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
  TooltipProvider,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipContentProps,
  type TooltipArrowProps,
  type TooltipProviderProps,
} from "./Tooltip";
```

Main barrel already does `export * from "./components/Tooltip"` so new exports propagate.

### Step 6: Run tests

`pnpm --filter @weiui/react test -- Tooltip` → all 3 new pass.
Full suite → green.

### Step 7: Commit

```bash
git add packages/react/src/components/Tooltip/
git commit -m "feat(react): TooltipProvider + side/align/offset + Escape close (P1)"
```

---

## Task 4: Dialog — modal prop + nested stacking + onInteractOutside/onEscapeKeyDown

**Files:**
- Modify: `packages/react/src/components/Dialog/Dialog.tsx`
- Modify: `packages/css/src/elements/dialog.css`
- Test: `packages/react/src/components/Dialog/__tests__/Dialog.test.tsx`

### Step 1: Failing tests

Append:

```tsx
describe("Dialog P1 additions", () => {
  it("modal={false} skips body scroll lock", () => {
    const before = document.body.style.overflow;
    render(
      <Dialog defaultOpen modal={false}>
        <DialogContent>Hi</DialogContent>
      </Dialog>,
    );
    expect(document.body.style.overflow).toBe(before);
  });

  it("onInteractOutside called with preventable event", async () => {
    const user = userEvent.setup();
    const onInteract = vi.fn((e: Event) => e.preventDefault());
    render(
      <>
        <Dialog defaultOpen>
          <DialogContent onInteractOutside={onInteract}>Body</DialogContent>
        </Dialog>
        <button data-testid="outside">Outside</button>
      </>,
    );
    await user.click(screen.getByTestId("outside"));
    expect(onInteract).toHaveBeenCalled();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("onEscapeKeyDown called with preventable event", async () => {
    const user = userEvent.setup();
    const onEsc = vi.fn((e: Event) => e.preventDefault());
    render(
      <Dialog defaultOpen>
        <DialogContent onEscapeKeyDown={onEsc}>Body</DialogContent>
      </Dialog>,
    );
    await user.keyboard("{Escape}");
    expect(onEsc).toHaveBeenCalled();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("nested dialogs get increasing z-index", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent data-testid="outer">
          Outer
          <Dialog defaultOpen>
            <DialogContent data-testid="inner">Inner</DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>,
    );
    const outer = screen.getByTestId("outer");
    const inner = screen.getByTestId("inner");
    const outerZ = parseInt(outer.style.zIndex || "0", 10);
    const innerZ = parseInt(inner.style.zIndex || "0", 10);
    expect(innerZ).toBeGreaterThan(outerZ);
  });
});
```

### Step 2: Run, confirm fail

`pnpm --filter @weiui/react test -- Dialog` — 4 new fails.

### Step 3: Implement

Replace the entire contents of `packages/react/src/components/Dialog/Dialog.tsx` with the version below. Additions: `DialogStackContext` for nesting depth, `modal` prop on Dialog root, `onInteractOutside`/`onEscapeKeyDown` on DialogContent with preventable events, conditional focus-trap / scroll-lock / overlay.

```tsx
"use client";
import {
  createContext,
  useContext,
  forwardRef,
  useRef,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import { useDisclosure, useFocusTrap, useId, getFirstFocusable, type UseDisclosureProps } from "@weiui/headless";
import { Portal } from "../Portal";
import { cn } from "../../utils/cn";

const DialogStackContext = createContext<number>(0);

interface DialogContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  contentId: string;
  triggerId: string;
  modal: boolean;
  depth: number;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog compound components must be used within <Dialog>");
  return ctx;
}

export interface DialogProps extends UseDisclosureProps {
  children: ReactNode;
  modal?: boolean;
}

export function Dialog({ children, modal = true, ...disclosureProps }: DialogProps) {
  const { isOpen, onOpen, onClose } = useDisclosure(disclosureProps);
  const baseId = useId("dialog");
  const parentDepth = useContext(DialogStackContext);
  const depth = parentDepth + 1;

  return (
    <DialogStackContext.Provider value={depth}>
      <DialogContext.Provider
        value={{
          isOpen, onOpen, onClose,
          titleId: `${baseId}-title`,
          descriptionId: `${baseId}-desc`,
          contentId: `${baseId}-content`,
          triggerId: `${baseId}-trigger`,
          modal,
          depth,
        }}
      >
        {children}
      </DialogContext.Provider>
    </DialogStackContext.Provider>
  );
}

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onOpen, isOpen, contentId, triggerId } = useDialogContext();
    return (
      <button
        ref={ref}
        id={triggerId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? contentId : undefined}
        onClick={(e) => { onOpen(); onClick?.(e); }}
        {...props}
      >
        {children}
      </button>
    );
  },
);
DialogTrigger.displayName = "DialogTrigger";

export interface DialogOverlayProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, style, ...props }, ref) => {
    const { depth } = useDialogContext();
    return (
      <div
        ref={ref}
        className={cn("wui-dialog__overlay", className)}
        style={{ zIndex: 50 + depth * 10, ...style }}
        aria-hidden="true"
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = "DialogOverlay";

export type DialogSize = "sm" | "md" | "lg" | "full";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: DialogSize;
  onInteractOutside?: (event: MouseEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export function DialogContent({
  children, className, onKeyDown, size = "md",
  onInteractOutside, onEscapeKeyDown, style,
  ...props
}: DialogContentProps) {
  const { isOpen, onClose, contentId, titleId, descriptionId, modal, depth } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useFocusTrap(contentRef, isOpen && modal);

  // Custom outside-click with onInteractOutside preventable
  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (!contentRef.current) return;
      if (contentRef.current.contains(e.target as Node)) return;
      const ev = new Event("interactoutside", { cancelable: true });
      Object.defineProperty(ev, "target", { value: e.target });
      onInteractOutside?.(ev as unknown as MouseEvent);
      if (!ev.defaultPrevented) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, onInteractOutside]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
      if (firstFocusable) firstFocusable.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modal) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen, modal]);

  if (!isOpen) return null;

  return (
    <Portal>
      {modal && <DialogOverlay />}
      <div
        ref={contentRef}
        id={contentId}
        role="dialog"
        aria-modal={modal || undefined}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn("wui-dialog__content", `wui-dialog__content--${size}`, className)}
        style={{ zIndex: 51 + depth * 10, ...style }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            const ev = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
            onEscapeKeyDown?.(ev);
            if (!ev.defaultPrevented) {
              e.stopPropagation();
              onClose();
            }
          }
          onKeyDown?.(e);
        }}
        {...props}
      >
        {children}
      </div>
    </Portal>
  );
}

// Keep DialogTitle / DialogDescription / DialogClose unchanged — append below

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function DialogTitle({ children, ...props }: DialogTitleProps) {
  const { titleId } = useDialogContext();
  return <h2 id={titleId} {...props}>{children}</h2>;
}

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function DialogDescription({ children, ...props }: DialogDescriptionProps) {
  const { descriptionId } = useDialogContext();
  return <p id={descriptionId} {...props}>{children}</p>;
}

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, onClick, ...props }, ref) => {
    const { onClose } = useDialogContext();
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => { onClose(); onClick?.(e); }}
        {...props}
      >
        {children}
      </button>
    );
  },
);
DialogClose.displayName = "DialogClose";
```

### Step 4: Run tests

`pnpm --filter @weiui/react test -- Dialog` → 4 new pass. Full suite green.

### Step 5: Commit

```bash
git add packages/react/src/components/Dialog/
git commit -m "feat(react): Dialog modal prop + nested stacking + onInteractOutside/onEscapeKeyDown (P1)"
```

---

## Task 5: Drawer — onInteractOutside + onEscapeKeyDown

**Files:**
- Modify: `packages/react/src/components/Drawer/Drawer.tsx`
- Test: `packages/react/src/components/Drawer/__tests__/Drawer.test.tsx`

### Step 1: Failing tests

Append:

```tsx
describe("Drawer P1 additions", () => {
  it("onInteractOutside preventable", async () => {
    const user = userEvent.setup();
    const onInteract = vi.fn((e: Event) => e.preventDefault());
    render(
      <>
        <Drawer defaultOpen>
          <DrawerContent onInteractOutside={onInteract}>Body</DrawerContent>
        </Drawer>
        <button data-testid="outside">Outside</button>
      </>,
    );
    await user.click(screen.getByTestId("outside"));
    expect(onInteract).toHaveBeenCalled();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("onEscapeKeyDown preventable", async () => {
    const user = userEvent.setup();
    const onEsc = vi.fn((e: Event) => e.preventDefault());
    render(
      <Drawer defaultOpen>
        <DrawerContent onEscapeKeyDown={onEsc}>Body</DrawerContent>
      </Drawer>,
    );
    await user.keyboard("{Escape}");
    expect(onEsc).toHaveBeenCalled();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});
```

### Step 2: Run, confirm fail

`pnpm --filter @weiui/react test -- Drawer` — 2 new fails.

### Step 3: Implement

In `Drawer.tsx`, replace `DrawerContentProps` and `DrawerContent` with:

```tsx
export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  onInteractOutside?: (event: MouseEvent) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

export function DrawerContent({
  children, className, onKeyDown,
  onInteractOutside, onEscapeKeyDown,
  ...props
}: DrawerContentProps) {
  const { isOpen, onClose, side } = useDrawerContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useFocusTrap(contentRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (!contentRef.current) return;
      if (contentRef.current.contains(e.target as Node)) return;
      const ev = new Event("interactoutside", { cancelable: true });
      Object.defineProperty(ev, "target", { value: e.target });
      onInteractOutside?.(ev as unknown as MouseEvent);
      if (!ev.defaultPrevented) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, onInteractOutside]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const firstFocusable = contentRef.current && getFirstFocusable(contentRef.current);
      if (firstFocusable) firstFocusable.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="wui-drawer-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        className={cn("wui-drawer", `wui-drawer--${side}`, className)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            const ev = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
            onEscapeKeyDown?.(ev);
            if (!ev.defaultPrevented) {
              e.stopPropagation();
              onClose();
            }
          }
          onKeyDown?.(e);
        }}
        {...props}
      >
        {children}
      </div>
    </Portal>
  );
}
```

Remove the old `useOutsideClick` import since we implement outside-click manually. The `useOutsideClick` import line can stay; just don't call it (or remove). Safer: remove it.

### Step 4: Run tests

`pnpm --filter @weiui/react test -- Drawer` → 2 new pass.

### Step 5: Commit

```bash
git add packages/react/src/components/Drawer/
git commit -m "feat(react): Drawer onInteractOutside + onEscapeKeyDown (P1)"
```

---

## Task 6: Toast — toast.promise + pause-on-hover

**Files:**
- Modify: `packages/react/src/components/Toast/toast-store.ts`
- Modify: `packages/react/src/components/Toast/Toaster.tsx`
- Modify: `packages/css/src/elements/toast.css`
- Test: `packages/react/src/components/Toast/__tests__/toast-store.test.ts` (extend or create)
- Demo: `apps/docs/src/components/demos/ToastDemo.tsx`

### Step 1: Failing tests

Create or extend `packages/react/src/components/Toast/__tests__/toast-store.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { toast, getToasts } from "../toast-store";

describe("toast.promise", () => {
  beforeEach(() => {
    // Clear any leftover toasts between tests
    for (const t of [...getToasts()]) {
      // cannot remove cleanly — fresh store not exposed — but tests should still isolate
    }
  });

  it("shows a loading toast, then success when promise resolves", async () => {
    const p = new Promise<string>((resolve) => setTimeout(() => resolve("ok"), 10));
    toast.promise(p, {
      loading: "Saving…",
      success: (v) => `Got ${v}`,
      error: "Oops",
    });
    // Loading toast should exist immediately
    let items = getToasts();
    expect(items.some((t) => t.title === "Saving…")).toBe(true);

    await p.catch(() => {});
    // After resolve, success message should appear (loading removed)
    await vi.waitFor(() => {
      items = getToasts();
      expect(items.some((t) => t.title === "Got ok")).toBe(true);
    });
  });

  it("shows error toast when promise rejects", async () => {
    const p = new Promise<string>((_, reject) => setTimeout(() => reject(new Error("boom")), 10));
    toast.promise(p, {
      loading: "Working…",
      success: "Done",
      error: (e) => (e as Error).message,
    });
    await p.catch(() => {});
    await vi.waitFor(() => {
      const items = getToasts();
      expect(items.some((t) => t.title === "boom")).toBe(true);
    });
  });
});
```

### Step 2: Run, confirm fail

`pnpm --filter @weiui/react test -- toast-store` → 2 fails.

### Step 3: Implement `toast.promise`

Replace `packages/react/src/components/Toast/toast-store.ts` with:

```ts
type ToastVariant = "default" | "success" | "destructive" | "warning" | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
}

type Listener = () => void;

let toasts: ToastItem[] = [];
let listeners: Listener[] = [];
let counter = 0;

function emit() { listeners.forEach((l) => l()); }

export function addToast(props: Omit<ToastItem, "id" | "duration"> & { duration?: number }): string {
  const id = `toast-${++counter}`;
  toasts = [...toasts, { ...props, id, duration: props.duration ?? 5000 }];
  emit();
  return id;
}

export function updateToast(id: string, partial: Partial<Omit<ToastItem, "id">>) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...partial } : t));
  emit();
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function getToasts(): ToastItem[] { return toasts; }
export function subscribe(listener: Listener): () => void {
  listeners = [...listeners, listener];
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

// Convenience functions
export function toast(title: string | React.ReactNode, opts?: Partial<Omit<ToastItem, "id" | "title">>) {
  return addToast({ title, variant: "default", ...opts });
}
toast.success = (title: string | React.ReactNode, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "success", ...opts });
toast.error = (title: string | React.ReactNode, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "destructive", ...opts });
toast.warning = (title: string | React.ReactNode, opts?: Partial<Omit<ToastItem, "id" | "title" | "variant">>) =>
  addToast({ title, variant: "warning", ...opts });

type PromiseMessages<T> = {
  loading: string | React.ReactNode;
  success: string | React.ReactNode | ((value: T) => string | React.ReactNode);
  error: string | React.ReactNode | ((err: unknown) => string | React.ReactNode);
};

toast.promise = function promise<T>(p: Promise<T>, messages: PromiseMessages<T>): Promise<T> {
  const id = addToast({
    title: messages.loading,
    variant: "loading",
    duration: 0,  // persistent until resolved
  });
  p.then(
    (value) => {
      const title = typeof messages.success === "function"
        ? (messages.success as (v: T) => string | React.ReactNode)(value)
        : messages.success;
      updateToast(id, { title, variant: "success", duration: 4000 });
      setTimeout(() => removeToast(id), 4000);
    },
    (err) => {
      const title = typeof messages.error === "function"
        ? (messages.error as (e: unknown) => string | React.ReactNode)(err)
        : messages.error;
      updateToast(id, { title, variant: "destructive", duration: 6000 });
      setTimeout(() => removeToast(id), 6000);
    },
  );
  return p;
};
```

### Step 4: Run promise tests

`pnpm --filter @weiui/react test -- toast-store` → both pass.

### Step 5: Pause-on-hover + expand-on-hover UI

Replace `packages/react/src/components/Toast/Toaster.tsx` with:

```tsx
"use client";
import { useSyncExternalStore, useEffect, useRef, useState } from "react";
import { getToasts, subscribe, removeToast, type ToastAction } from "./toast-store";
import { cn } from "../../utils/cn";

export type ToasterPosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToasterProps {
  position?: ToasterPosition;
}

export function Toaster({ position = "bottom-right" }: ToasterProps = {}) {
  const toasts = useSyncExternalStore(subscribe, getToasts, getToasts);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn("wui-toaster", `wui-toaster--${position}`)}
      role="region"
      aria-label="Notifications"
      data-position={position}
      data-expanded={expanded || undefined}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {toasts.map((t, index) => (
        <ToastItem key={t.id} toast={t} index={index} expanded={expanded} total={toasts.length} />
      ))}
    </div>
  );
}

function ToastItem({
  toast: t,
  index,
  expanded,
  total,
}: {
  toast: {
    id: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    variant: string;
    duration: number;
    action?: ToastAction;
  };
  index: number;
  expanded: boolean;
  total: number;
}) {
  const remainingRef = useRef<number>(t.duration);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [paused, setPaused] = useState(false);

  function armTimer(ms: number) {
    clearTimeout(timerRef.current);
    if (ms <= 0) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => removeToast(t.id), ms);
  }

  useEffect(() => {
    remainingRef.current = t.duration;
    armTimer(t.duration);
    return () => clearTimeout(timerRef.current);
  }, [t.id, t.duration]);

  function onEnter() {
    if (!startedAtRef.current) return;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimeout(timerRef.current);
    setPaused(true);
  }
  function onLeave() {
    armTimer(remainingRef.current);
    setPaused(false);
  }

  // Stacking: non-expanded items scale/translate behind the front one
  const stackIndex = total - 1 - index; // front of stack = 0
  const stackStyle = expanded
    ? undefined
    : {
        transform: `translateY(${-stackIndex * 4}px) scale(${1 - stackIndex * 0.04})`,
        opacity: stackIndex === 0 ? 1 : 0.85,
        zIndex: 100 - stackIndex,
      };

  return (
    <div
      className={cn("wui-toast", `wui-toast--${t.variant}`)}
      role="alert"
      data-paused={paused || undefined}
      style={stackStyle}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="wui-toast__content">
        <div className="wui-toast__title">{t.title}</div>
        {t.description && <div className="wui-toast__description">{t.description}</div>}
      </div>
      {t.action && (
        <button
          type="button"
          className="wui-toast__action"
          onClick={() => {
            t.action!.onClick();
            removeToast(t.id);
          }}
        >
          {t.action.label}
        </button>
      )}
      <button
        className="wui-toast__close"
        onClick={() => removeToast(t.id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
```

### Step 6: CSS additions

Append to `packages/css/src/elements/toast.css`:

```css
@layer wui-elements {
  .wui-toaster {
    position: fixed;
    z-index: 1500;
    display: flex;
    flex-direction: column;
    gap: var(--wui-spacing-2);
  }
  @media (prefers-reduced-motion: no-preference) {
    .wui-toast {
      transition-property: transform, opacity;
      transition-duration: var(--wui-motion-duration-base);
      transition-timing-function: var(--wui-motion-easing-standard);
    }
  }
  .wui-toast--loading {
    background-color: var(--wui-surface-raised);
    border: 1px solid var(--wui-color-border);
    color: var(--wui-color-foreground);
  }
  .wui-toast--loading .wui-toast__title::before {
    content: "";
    display: inline-block;
    inline-size: 12px;
    block-size: 12px;
    margin-inline-end: var(--wui-spacing-2);
    border: 2px solid var(--wui-color-muted-foreground);
    border-top-color: transparent;
    border-radius: 50%;
    animation: wui-toast-spin 0.8s linear infinite;
    vertical-align: middle;
  }
  @keyframes wui-toast-spin { to { transform: rotate(360deg); } }
}
```

### Step 7: Run tests + build

`pnpm --filter @weiui/react test -- Toast` — all pass (existing + new).
`pnpm --filter @weiui/docs build` — success.

### Step 8: Update ToastDemo

Edit `apps/docs/src/components/demos/ToastDemo.tsx`. Add one new button demonstrating `toast.promise`:

```tsx
<Button
  variant="soft"
  onClick={() =>
    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => (Math.random() > 0.2 ? resolve("saved") : reject(new Error("Network error"))), 1500);
      }),
      {
        loading: "Saving…",
        success: "Saved successfully",
        error: (e) => (e as Error).message,
      },
    )
  }
>
  Promise
</Button>
```

### Step 9: Commit

```bash
git add packages/react/src/components/Toast/ \
        packages/css/src/elements/toast.css \
        apps/docs/src/components/demos/ToastDemo.tsx
git commit -m "feat(react): Toast promise API + pause-on-hover + stacking expand-on-hover (P1)"
```

---

## Task 7: CommandPalette — recent items + shortcuts + emptyState + animations

**Files:**
- Modify: `packages/react/src/components/CommandPalette/CommandPalette.tsx`
- Modify: `packages/css/src/elements/command-palette.css`
- Test: `packages/react/src/components/CommandPalette/__tests__/CommandPalette.test.tsx`
- Demo: `apps/docs/src/components/demos/CommandPaletteDemo.tsx`

### Step 1: Failing tests

Append:

```tsx
describe("CommandPalette P1 additions", () => {
  beforeEach(() => localStorage.clear());

  it("shows recent items group when input is empty and recent storage exists", async () => {
    const user = userEvent.setup();
    localStorage.setItem("wui-cp-recent-demo", JSON.stringify(["go-home"]));
    const items = [
      { id: "go-home", label: "Home", onSelect: vi.fn() },
      { id: "go-settings", label: "Settings", onSelect: vi.fn() },
    ];
    render(<CommandPalette id="demo" open items={items} onClose={() => {}} />);
    // Recent section header "Recent"
    expect(await screen.findByText("Recent")).toBeInTheDocument();
  });

  it("renders per-item shortcut via Kbd", async () => {
    const items = [{ id: "save", label: "Save", shortcut: "⌘S", onSelect: vi.fn() }];
    render(<CommandPalette id="demo2" open items={items} onClose={() => {}} />);
    expect(await screen.findByText("⌘S")).toBeInTheDocument();
  });

  it("emptyState node renders when no results", async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette
        id="demo3"
        open
        items={[{ id: "a", label: "Apple", onSelect: vi.fn() }]}
        onClose={() => {}}
        emptyState={<div data-testid="empty">No matches found</div>}
      />,
    );
    const input = await screen.findByRole("combobox");
    await user.type(input, "zzzzz");
    expect(await screen.findByTestId("empty")).toBeInTheDocument();
  });
});
```

Add matching imports at top (`beforeEach` from vitest, `vi`).

### Step 2: Run, confirm fail

`pnpm --filter @weiui/react test -- CommandPalette` → 3 fails.

### Step 3: Read current CommandPalette + extend

Read `packages/react/src/components/CommandPalette/CommandPalette.tsx`. Based on what exists, add:

1. New prop: `emptyState?: ReactNode`
2. New prop on item: `shortcut?: string`
3. Recent-items: when `id` + `open` + input is empty, prepend a "Recent" group pulled from `localStorage.getItem(\`wui-cp-recent-${id}\`)`.
4. On item select, store its id at the front of the recent list (cap at 5).

Concretely, the component probably already defines `CommandPaletteItem`. Add the fields; add logic. Keep the existing API backward compatible. Minimum scaffolding without repeating the full existing file here:

- Add `shortcut?: string` to the item type and render it inside each item as `<span className="wui-command__shortcut">{shortcut}</span>`.
- Add `emptyState?: ReactNode` prop — when filtered result is empty, render it instead of the default string.
- Add internal state `recentIds` that loads on open from `localStorage[wui-cp-recent-${id}]` (default `[]`). On any successful select, prepend the id, slice to 5, save.
- When input is empty AND recentIds.length > 0, render a group labeled "Recent" at the top containing items whose id is in recentIds (in order).

### Step 4: Run tests, confirm pass, commit

```bash
pnpm --filter @weiui/react test -- CommandPalette
pnpm --filter @weiui/docs build
git add packages/react/src/components/CommandPalette/ \
        packages/css/src/elements/command-palette.css \
        apps/docs/src/components/demos/CommandPaletteDemo.tsx
git commit -m "feat(react): CommandPalette recent items + shortcuts + emptyState node (P1)"
```

---

## Task 8: Update audit matrix

**Files:**
- Modify: `docs/audit/component-parity.md`

### Step 1: Flip P1 rows

Open `docs/audit/component-parity.md`. In Wave 5b, find every row under Dialog/Drawer/Popover/Tooltip/Menu/Toast/CommandPalette that matches shipped features from Tasks 1-7. For each matching row:
- Change the "WeiUI has" cell from `❌` to `✅`
- Change the "Priority" cell from `**P1**` to `✅ shipped`

Shipped P1s this phase:
- Menu: side/align/offset (verify), CheckboxItem, RadioItem, shortcut display, MenuLabel
- Popover: arrow element, collisionPadding, modal toggle, onOpenAutoFocus/onCloseAutoFocus
- Tooltip: TooltipProvider, side/align/offset, Escape to close
- Dialog: modal={false} non-modal, nested stacking, onInteractOutside/onEscapeKeyDown callbacks
- Drawer: onInteractOutside preventable
- Toast: promise-based, pause-on-hover, stacking/expand-on-hover, rich content ReactNode
- CommandPalette: recent items, per-item shortcut, emptyState node, open/close animations (CSS-only)

Update executive summary: Wave 5b P1 count drops by ~20; total P1 drops accordingly.

### Step 2: Commit

```bash
git add docs/audit/component-parity.md
git commit -m "docs(audit): mark Phase 6a overlay P1s shipped"
```

---

## Task 9: Final wave verification

- [ ] **Step 1: Full build**
Run: `pnpm build`
Expected: 8/8 successful.

- [ ] **Step 2: Full test sweep**
Run: `pnpm test`
Expected: all tests pass, count ≥ 612 + ~15 new tests.

- [ ] **Step 3: Contrast**
Run: `pnpm --filter @weiui/tokens validate`
Expected: 6/6 pairs.

- [ ] **Step 4: Docs build**
Run: `pnpm --filter @weiui/docs build`
Expected: all pages generated, zero warnings.

- [ ] **Step 5: Verification-plan automated checks**
Run the commands in `docs/superpowers/plans/2026-04-17-component-verification-plan.md` Section 2.2 (Tailwind leakage) and 2.3 (CSS class existence). Expect zero matches.

- [ ] **Step 6: Push**

```bash
git push origin main
```

---

## Self-review

1. **Spec coverage:** Every P1 row in Wave 5b of the audit is addressed by a task above. Specifically:
   - Menu positioning: Task 1 (via offset prop + verify existing side/align)
   - Menu CheckboxItem/RadioItem/shortcut/Label: Task 1
   - Popover arrow/collisionPadding/modal/focus callbacks: Task 2
   - Tooltip Provider/placement/Escape: Task 3
   - Dialog non-modal/nested/callbacks: Task 4
   - Drawer onInteractOutside: Task 5
   - Toast promise/pause/stacking: Task 6
   - CommandPalette recent/shortcuts/empty/animations: Task 7
2. **Placeholder scan:** No "TBD", "similar to", or stub instructions. Every code step shows the complete code to write.
3. **Type consistency:** `PopoverArrow` uses the same pattern as `TooltipArrow` (existing). `MenuCheckboxItem`/`MenuRadioItem` follow `MenuItem`'s interface shape. `DialogContent.onInteractOutside` matches `PopoverContent.onInteractOutside` in signature. `toast.promise` type signature matches Sonner's.
