# @weiui/headless

Unstyled, accessible React primitives. Hooks + compound components that implement WAI-ARIA patterns without opinions about presentation.

## Install

```bash
pnpm add @weiui/headless
```

## What's inside

**Hooks**
- `useControllable` — controlled/uncontrolled state with a single hook
- `useDisclosure` — open/close state with imperative helpers
- `useFocusTrap` — trap focus inside a container (e.g. modal, popover)
- `useId` — SSR-safe stable IDs
- `useKeyboardNav` — roving tabindex + arrow key navigation
- `useOutsideClick` — detect clicks outside a ref
- `useToggle` — boolean state toggle
- `useFloatingMenu` — `@floating-ui/react` wrapper for menus, tooltips, popovers

**Compound components**
- `Accordion`
- `Combobox`
- `Dialog`
- `Menu`
- `Popover`
- `Select`
- `Tabs`
- `Tooltip`

**A11y utilities**
- `announce(message, priority?)` — live-region announcer for screen readers

## Usage

```tsx
import { Dialog, DialogTrigger, DialogContent } from "@weiui/headless";

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    Content (add your own styles)
  </DialogContent>
</Dialog>
```

## Philosophy

- Zero styling — bring your own CSS or Tailwind
- `@floating-ui/react` is the only runtime dep
- Every compound component ships a typed context so consumers can compose their own sub-components
- `forwardRef` on everything

## Status

v0.0.1. Compound components and hooks cover Wave 1–3 needs of `@weiui/react`. Tests live under `src/**/__tests__`.
