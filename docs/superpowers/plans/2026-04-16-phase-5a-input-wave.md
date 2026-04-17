# Phase 5a — Input Family Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Close all 13 P0 gaps across the 7 input-family components (Input, Textarea, InputNumber, InputOTP, AutoComplete, MultiSelect, FileUpload). Wave closes when every P0 row in the audit matrix moves from "missing" to "WeiUI has."

**Architecture:** P0 fixes land one component family at a time with tests + doc updates. Shared infrastructure (floating placement) lands first so AutoComplete and MultiSelect can both consume it. P1/P2 items are deferred.

**Tech Stack:** React 19, `@floating-ui/react` (already a dep), `Intl.NumberFormat`, Vitest, Playwright interaction tests.

**Spec reference:** `docs/superpowers/specs/2026-04-16-polish-overhaul-design.md` §9.1
**Audit reference:** `docs/audit/component-parity.md` Wave 5a section.

---

## P0 inventory (the 13 gaps this wave closes)

| Component | P0 fix | Target |
|-----------|--------|--------|
| Input | Size variants (sm/md/lg) | Add `size` prop + CSS modifier classes |
| Input | Start/end icon/addon slots | Add `startAddon` / `endAddon` props |
| Textarea | Size variant | Add `size` prop |
| InputNumber | Locale-aware formatting | Add `formatOptions` with `Intl.NumberFormat` |
| InputNumber | `role="spinbutton"` + `aria-valuenow/min/max/text` | Wire ARIA attributes |
| InputOTP | Arrow-key navigation between slots | Add keydown handler |
| InputOTP | `autoComplete="one-time-code"` | Add attr on first slot |
| AutoComplete | Async loading state | Add `loading` prop + pending slot |
| AutoComplete | Floating placement | Use `@floating-ui/react` |
| MultiSelect | Typeahead filter input | Add internal search input |
| MultiSelect | Floating placement | Use `@floating-ui/react` |
| FileUpload | `onError` for size/type rejections | Expose error callback + validation errors |
| FileUpload | Error messaging UI | Add error slot / aria-live region |

---

## File Structure

**New files:**
- `packages/headless/src/use-floating-menu.ts` — reusable floating-placement hook for AutoComplete/MultiSelect (and future DatePicker, Menu, etc.)

**Modified files:**
- `packages/react/src/components/Input/Input.tsx`
- `packages/react/src/components/Textarea/Textarea.tsx`
- `packages/react/src/components/InputNumber/InputNumber.tsx`
- `packages/react/src/components/InputOTP/InputOTP.tsx`
- `packages/react/src/components/AutoComplete/AutoComplete.tsx`
- `packages/react/src/components/MultiSelect/MultiSelect.tsx`
- `packages/react/src/components/FileUpload/FileUpload.tsx`
- Matching `__tests__` files for each (extend, don't replace)
- CSS files under `packages/css/src/elements/` for Input/Textarea size classes
- `docs/audit/component-parity.md` — mark P0 rows as ✅ once each task lands

---

## Task 1: Shared `useFloatingMenu` hook

**File:** `packages/headless/src/use-floating-menu.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/headless/src/__tests__/use-floating-menu.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFloatingMenu } from "../use-floating-menu";

describe("useFloatingMenu", () => {
  it("returns refs and style objects", () => {
    const { result } = renderHook(() => useFloatingMenu({ open: false }));
    expect(result.current.refs.setReference).toBeTypeOf("function");
    expect(result.current.refs.setFloating).toBeTypeOf("function");
    expect(result.current.floatingStyles).toBeDefined();
  });
});
```

Run: `pnpm --filter @weiui/headless test` — confirm fail.

- [ ] **Step 2: Create the hook**

```ts
"use client";

import { useFloating, autoUpdate, offset, flip, shift, type Placement } from "@floating-ui/react";

export interface UseFloatingMenuOptions {
  open: boolean;
  placement?: Placement;
  offsetPx?: number;
  collisionPadding?: number;
}

export function useFloatingMenu(options: UseFloatingMenuOptions) {
  const { open, placement = "bottom-start", offsetPx = 4, collisionPadding = 8 } = options;
  return useFloating({
    open,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [offset(offsetPx), flip({ padding: collisionPadding }), shift({ padding: collisionPadding })],
  });
}
```

- [ ] **Step 3: Export from `packages/headless/src/index.ts`**

Append: `export { useFloatingMenu, type UseFloatingMenuOptions } from "./use-floating-menu";`

- [ ] **Step 4: Test + build + commit**

```bash
pnpm --filter @weiui/headless test -- use-floating-menu
pnpm --filter @weiui/headless build
git add packages/headless/src/use-floating-menu.ts \
        packages/headless/src/__tests__/use-floating-menu.test.tsx \
        packages/headless/src/index.ts
git commit -m "feat(headless): add useFloatingMenu shared floating-placement hook"
```

---

## Task 2: Input — size variants + addon slots

**Files:**
- Modify: `packages/react/src/components/Input/Input.tsx`
- Modify: `packages/css/src/elements/input.css`
- Modify: `packages/react/src/components/Input/__tests__/Input.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append to `Input.test.tsx`:

```tsx
it("renders sm size class", () => {
  const { container } = render(<Input size="sm" />);
  expect(container.querySelector(".wui-input--sm")).not.toBeNull();
});

it("renders lg size class", () => {
  const { container } = render(<Input size="lg" />);
  expect(container.querySelector(".wui-input--lg")).not.toBeNull();
});

it("renders startAddon and endAddon", () => {
  render(
    <Input
      startAddon={<span data-testid="start">$</span>}
      endAddon={<span data-testid="end">.00</span>}
    />,
  );
  expect(screen.getByTestId("start")).toBeInTheDocument();
  expect(screen.getByTestId("end")).toBeInTheDocument();
});
```

Run tests — confirm fail.

- [ ] **Step 2: Replace `Input.tsx`**

```tsx
"use client";
import { forwardRef, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  startAddon?: ReactNode;
  endAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, size = "md", startAddon, endAddon, ...props }, ref) => {
    const sizeClass = size === "sm" ? "wui-input--sm" : size === "lg" ? "wui-input--lg" : "";
    const hasAddons = Boolean(startAddon || endAddon);

    const inputEl = (
      <input
        ref={ref}
        className={cn(
          "wui-input",
          sizeClass,
          props.disabled && "wui-input--disabled",
          hasAddons && "wui-input--with-addons",
          !hasAddons && className,
        )}
        aria-invalid={invalid || undefined}
        data-invalid={invalid || undefined}
        {...props}
      />
    );

    if (!hasAddons) return inputEl;

    return (
      <div
        className={cn("wui-input-group", sizeClass, className)}
        data-invalid={invalid || undefined}
      >
        {startAddon && <span className="wui-input-group__addon">{startAddon}</span>}
        {inputEl}
        {endAddon && <span className="wui-input-group__addon">{endAddon}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
```

- [ ] **Step 3: Append input-group styles to `input.css`**

Append (inside a new `@layer wui-elements` block):

```css
@layer wui-elements {
  .wui-input-group {
    display: inline-flex;
    align-items: center;
    inline-size: 100%;
    min-block-size: 44px;
    background-color: var(--wui-color-background);
    border: var(--wui-shape-border-width-thin) solid var(--wui-color-border);
    border-radius: var(--wui-shape-radius-md);
    box-shadow: inset 0 1px 2px 0 oklch(0 0 0 / 0.04);
    overflow: hidden;
  }
  .wui-input-group.wui-input--sm { min-block-size: 36px; }
  .wui-input-group.wui-input--lg { min-block-size: 48px; }
  .wui-input-group:hover { border-color: color-mix(in oklch, var(--wui-color-border) 60%, var(--wui-color-foreground)); }
  .wui-input-group:focus-within {
    border-color: var(--wui-color-ring);
    outline: 3px solid var(--wui-color-ring-soft);
    outline-offset: 0;
  }
  .wui-input-group[data-invalid] {
    border-color: var(--wui-color-destructive);
  }
  .wui-input-group__addon {
    display: inline-flex; align-items: center; justify-content: center;
    padding-inline: var(--wui-spacing-3);
    color: var(--wui-color-muted-foreground);
    font-size: var(--wui-font-size-sm);
    flex: 0 0 auto;
    pointer-events: none;
  }
  .wui-input-group__addon:has(button),
  .wui-input-group__addon:has(a),
  .wui-input-group__addon:has([role="button"]) {
    pointer-events: auto;
  }
  .wui-input-group .wui-input {
    border: none;
    box-shadow: none;
    background: transparent;
    min-block-size: 0;
    outline: none;
  }
  .wui-input-group .wui-input:focus-within {
    outline: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    .wui-input-group {
      transition-property: border-color, outline-color, background-color, box-shadow;
      transition-duration: var(--wui-motion-duration-fast);
      transition-timing-function: var(--wui-motion-easing-standard);
    }
  }
}
```

- [ ] **Step 4: Test + build + commit**

```bash
pnpm --filter @weiui/react test -- Input
pnpm --filter @weiui/css build
pnpm --filter @weiui/react build
git add packages/react/src/components/Input/Input.tsx \
        packages/react/src/components/Input/__tests__/Input.test.tsx \
        packages/css/src/elements/input.css
git commit -m "feat(react): Input size variants + start/end addon slots (P0)"
```

---

## Task 3: Textarea — size variant

**Files:**
- Modify: `packages/react/src/components/Textarea/Textarea.tsx`
- Modify: `packages/react/src/components/Textarea/__tests__/Textarea.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
it("renders sm size class", () => {
  const { container } = render(<Textarea size="sm" />);
  expect(container.querySelector(".wui-input--sm")).not.toBeNull();
});
```

- [ ] **Step 2: Update Textarea.tsx**

Read the current file. Add `size?: "sm" | "md" | "lg"` to the props type. Apply the size class in the className like Input does. Default `size = "md"`.

- [ ] **Step 3: Test + commit**

```bash
pnpm --filter @weiui/react test -- Textarea
git add packages/react/src/components/Textarea/
git commit -m "feat(react): Textarea size variant (P0)"
```

---

## Task 4: InputNumber — locale formatting + spinbutton ARIA

**Files:**
- Modify: `packages/react/src/components/InputNumber/InputNumber.tsx`
- Modify: `packages/react/src/components/InputNumber/__tests__/InputNumber.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
it("formats value with locale thousands separator", () => {
  render(<InputNumber value={1234567} formatOptions={{ style: "decimal" }} />);
  const input = screen.getByRole("spinbutton");
  expect(input).toHaveValue("1,234,567");
});

it("formats as currency", () => {
  render(<InputNumber value={42.5} formatOptions={{ style: "currency", currency: "USD" }} />);
  const input = screen.getByRole("spinbutton");
  expect(input).toHaveValue("$42.50");
});

it("has role=spinbutton and aria-valuenow/min/max", () => {
  render(<InputNumber value={5} min={0} max={10} />);
  const input = screen.getByRole("spinbutton");
  expect(input).toHaveAttribute("aria-valuenow", "5");
  expect(input).toHaveAttribute("aria-valuemin", "0");
  expect(input).toHaveAttribute("aria-valuemax", "10");
});
```

- [ ] **Step 2: Update InputNumber.tsx**

Read the file. Add:
- `formatOptions?: Intl.NumberFormatOptions` prop.
- Memoize a `Intl.NumberFormat` instance keyed on `formatOptions` and current locale.
- Format the displayed `value` using `formatter.format(numValue)` when `formatOptions` is present. When user types, parse by stripping non-numeric characters (except `.` and `-`) and preserve typing state until blur.
- On the input element, set `role="spinbutton"`, `aria-valuenow={value}`, `aria-valuemin={min}`, `aria-valuemax={max}`, and `aria-valuetext={formatter.format(value)}` when formatting.

- [ ] **Step 3: Test + commit**

```bash
pnpm --filter @weiui/react test -- InputNumber
git add packages/react/src/components/InputNumber/
git commit -m "feat(react): InputNumber locale formatting + spinbutton ARIA (P0)"
```

---

## Task 5: InputOTP — arrow keys + autocomplete one-time-code

**Files:**
- Modify: `packages/react/src/components/InputOTP/InputOTP.tsx`
- Modify: `packages/react/src/components/InputOTP/__tests__/InputOTP.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
it("ArrowLeft moves focus to previous slot", async () => {
  const user = userEvent.setup();
  render(<InputOTP length={4} />);
  const inputs = screen.getAllByRole("textbox");
  await user.click(inputs[2]);
  await user.keyboard("{ArrowLeft}");
  expect(inputs[1]).toHaveFocus();
});

it("ArrowRight moves focus to next slot", async () => {
  const user = userEvent.setup();
  render(<InputOTP length={4} />);
  const inputs = screen.getAllByRole("textbox");
  await user.click(inputs[1]);
  await user.keyboard("{ArrowRight}");
  expect(inputs[2]).toHaveFocus();
});

it("first input has autoComplete=one-time-code", () => {
  render(<InputOTP length={6} />);
  const inputs = screen.getAllByRole("textbox");
  expect(inputs[0]).toHaveAttribute("autocomplete", "one-time-code");
});
```

- [ ] **Step 2: Update InputOTP.tsx**

Read the file. In the keydown handler add cases for:
- `ArrowLeft` → focus previous slot (unless index 0)
- `ArrowRight` → focus next slot (unless last)

Add `autoComplete="one-time-code"` to the first input only.

- [ ] **Step 3: Test + commit**

```bash
pnpm --filter @weiui/react test -- InputOTP
git add packages/react/src/components/InputOTP/
git commit -m "feat(react): InputOTP arrow-key nav + one-time-code autofill (P0)"
```

---

## Task 6: AutoComplete — floating placement + async loading

**Files:**
- Modify: `packages/react/src/components/AutoComplete/AutoComplete.tsx`
- Modify: `packages/react/src/components/AutoComplete/__tests__/AutoComplete.test.tsx`
- Modify: `packages/css/src/elements/autocomplete.css` (if dropdown positioning rules need adjustment)

- [ ] **Step 1: Write failing tests**

```tsx
it("renders loading indicator when loading=true", () => {
  render(<AutoComplete options={[]} loading />);
  expect(screen.getByRole("status") || screen.getByText(/loading/i)).toBeTruthy();
});

it("applies floating placement styles to dropdown", async () => {
  const user = userEvent.setup();
  render(<AutoComplete options={[{ value: "a", label: "A" }]} />);
  const input = screen.getByRole("combobox");
  await user.click(input);
  const listbox = screen.getByRole("listbox");
  // floating-ui writes top/left via inline style
  expect(listbox).toHaveStyle({ position: "absolute" });
});
```

- [ ] **Step 2: Update AutoComplete.tsx**

Read the current file. Replace absolute-positioned dropdown with `useFloatingMenu`:

```tsx
import { useFloatingMenu } from "@weiui/headless";

// inside component:
const { refs, floatingStyles } = useFloatingMenu({ open: isOpen });

// apply to trigger:
<input ref={refs.setReference} ... />

// apply to listbox:
<ul ref={refs.setFloating} style={floatingStyles} role="listbox" ...>
```

Add:
- `loading?: boolean` prop
- When `loading`, render a `<div role="status" aria-live="polite" className="wui-autocomplete__loading">Loading…</div>` as first child of the listbox

- [ ] **Step 3: Append styles**

Append to `autocomplete.css`:

```css
@layer wui-elements {
  .wui-autocomplete__loading {
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-2);
    font-size: var(--wui-font-size-sm);
    color: var(--wui-color-muted-foreground);
  }
}
```

- [ ] **Step 4: Test + commit**

```bash
pnpm --filter @weiui/react test -- AutoComplete
git add packages/react/src/components/AutoComplete/ \
        packages/css/src/elements/autocomplete.css
git commit -m "feat(react): AutoComplete floating placement + loading state (P0)"
```

---

## Task 7: MultiSelect — typeahead filter + floating placement

**Files:**
- Modify: `packages/react/src/components/MultiSelect/MultiSelect.tsx`
- Modify: `packages/react/src/components/MultiSelect/__tests__/MultiSelect.test.tsx`
- Modify: `packages/css/src/elements/multi-select.css`

- [ ] **Step 1: Write failing tests**

```tsx
it("filters options by typing in the search input", async () => {
  const user = userEvent.setup();
  render(<MultiSelect options={[{ value: "a", label: "Apple" }, { value: "b", label: "Banana" }]} />);
  const trigger = screen.getByRole("combobox");
  await user.click(trigger);
  const search = screen.getByPlaceholderText(/search/i);
  await user.type(search, "app");
  expect(screen.queryByText("Banana")).not.toBeInTheDocument();
  expect(screen.getByText("Apple")).toBeInTheDocument();
});

it("applies floating placement to dropdown", async () => {
  const user = userEvent.setup();
  render(<MultiSelect options={[{ value: "a", label: "A" }]} />);
  const trigger = screen.getByRole("combobox");
  await user.click(trigger);
  const listbox = screen.getByRole("listbox");
  expect(listbox).toHaveStyle({ position: "absolute" });
});
```

- [ ] **Step 2: Update MultiSelect.tsx**

Read the file. Swap absolute-positioned dropdown for `useFloatingMenu` the same way as AutoComplete.

Add a search input inside the dropdown as the first child (before option list):

```tsx
<input
  type="text"
  className="wui-multi-select__search"
  placeholder="Search…"
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  autoFocus
/>
```

Filter the rendered option list by `option.label.toLowerCase().includes(filter.toLowerCase())`.

- [ ] **Step 3: Append styles**

```css
@layer wui-elements {
  .wui-multi-select__search {
    inline-size: 100%;
    padding-inline: var(--wui-spacing-3); padding-block: var(--wui-spacing-2);
    background: transparent;
    border: none;
    border-block-end: 1px solid var(--wui-color-border);
    font-size: var(--wui-font-size-sm);
    outline: none;
    color: var(--wui-color-foreground);
  }
  .wui-multi-select__search::placeholder { color: var(--wui-color-muted-foreground); }
}
```

- [ ] **Step 4: Test + commit**

```bash
pnpm --filter @weiui/react test -- MultiSelect
git add packages/react/src/components/MultiSelect/ \
        packages/css/src/elements/multi-select.css
git commit -m "feat(react): MultiSelect typeahead filter + floating placement (P0)"
```

---

## Task 8: FileUpload — onError callback + error messaging

**Files:**
- Modify: `packages/react/src/components/FileUpload/FileUpload.tsx`
- Modify: `packages/react/src/components/FileUpload/__tests__/FileUpload.test.tsx`
- Modify: `packages/css/src/elements/file-upload.css`

- [ ] **Step 1: Write failing tests**

```tsx
it("fires onError when file exceeds maxSize", async () => {
  const onError = vi.fn();
  const user = userEvent.setup();
  render(<FileUpload maxSize={10} onError={onError} />);
  const input = screen.getByLabelText(/upload/i) as HTMLInputElement;
  const tooBig = new File(["x".repeat(100)], "big.txt", { type: "text/plain" });
  await user.upload(input, tooBig);
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ reason: "size", file: expect.objectContaining({ name: "big.txt" }) }),
  );
});

it("fires onError when file type is not accepted", async () => {
  const onError = vi.fn();
  const user = userEvent.setup();
  render(<FileUpload accept="image/*" onError={onError} />);
  const input = screen.getByLabelText(/upload/i) as HTMLInputElement;
  const wrongType = new File(["x"], "doc.pdf", { type: "application/pdf" });
  await user.upload(input, wrongType);
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ reason: "type" }),
  );
});
```

- [ ] **Step 2: Update FileUpload.tsx**

Read the file. Add to the props type:

```ts
export type FileUploadError = {
  reason: "size" | "type" | "count";
  file: File;
  message: string;
};

onError?: (error: FileUploadError) => void;
```

In the file-accept handler (wherever `maxSize` and `accept` are currently checked), call `onError?.({ reason, file, message })` when a file is rejected, BEFORE silently dropping it.

Track rejected files in state as `errors: FileUploadError[]` and render:

```tsx
{errors.length > 0 && (
  <div className="wui-file-upload__errors" role="alert" aria-live="polite">
    {errors.map((err, i) => <div key={i}>{err.message}</div>)}
  </div>
)}
```

Clear errors when a new drop/select starts successfully.

- [ ] **Step 3: Append styles**

```css
@layer wui-elements {
  .wui-file-upload__errors {
    margin-block-start: var(--wui-spacing-3);
    padding: var(--wui-spacing-3);
    background-color: color-mix(in oklch, var(--wui-color-destructive) 5%, var(--wui-color-background));
    border: 1px solid color-mix(in oklch, var(--wui-color-destructive) 40%, var(--wui-color-border));
    color: var(--wui-color-destructive);
    border-radius: var(--wui-shape-radius-base);
    font-size: var(--wui-font-size-sm);
  }
}
```

- [ ] **Step 4: Test + commit**

```bash
pnpm --filter @weiui/react test -- FileUpload
git add packages/react/src/components/FileUpload/ \
        packages/css/src/elements/file-upload.css
git commit -m "feat(react): FileUpload onError + error message UI (P0)"
```

---

## Task 9: Update audit matrix — mark P0 rows as shipped

**File:** `docs/audit/component-parity.md`

- [ ] **Step 1: Find each P0 row that was fixed**

For each of the 13 P0 gaps in the inventory at the top of this plan, find the corresponding row in `docs/audit/component-parity.md` (under Wave 5a) and flip the "WeiUI has" cell from `❌` to `✅` and the "Priority" cell from `**P0**` to `✅ shipped`.

- [ ] **Step 2: Update the executive summary**

Decrease Wave 5a P0 count from 13 → 0. Update total P0 from 69 → 56.

- [ ] **Step 3: Commit**

```bash
git add docs/audit/component-parity.md
git commit -m "docs(audit): mark Wave 5a P0 gaps as shipped (13 → 0)"
```

---

## Task 10: Final wave verification

- [ ] Full build: `pnpm build`
- [ ] All tests: `pnpm test` (should pass; new tests added)
- [ ] Typecheck: `pnpm -r typecheck` — no errors
- [ ] Contrast validation: `pnpm --filter @weiui/tokens validate` — unchanged
- [ ] Manual check: open dev server, verify:
  - `<Input size="sm" startAddon="$" endAddon=".00" />` renders correctly
  - `<Textarea size="lg" />` renders
  - `<InputNumber value={1234} formatOptions={{ style: 'currency', currency: 'USD' }} />` shows "$1,234"
  - `<InputOTP length={6} />` navigable via ArrowLeft/Right
  - `<AutoComplete options={[...]} loading />` shows "Loading…"
  - `<MultiSelect options={[...]} />` has search input in dropdown
  - `<FileUpload accept="image/*" onError={console.log} />` logs on PDF drop

Report Wave 5a complete.
