# @weiui/headless

> **Deprecated compatibility package.** Existing React imports continue to work, but shared behavior now belongs to `@weiui/core`. New React code should prefer `@weiui/react/headless`; Vue, Solid, Svelte and Custom Elements use their native WeiUI runtime packages.

The package remains an unstyled React renderer/lifecycle adapter for existing users. React context, refs, portals, focus lifecycle and Floating UI bindings stay here where they are framework-specific; reusable open/close, selection, highlighted state and ARIA semantics are backed by `@weiui/core` controllers.

```tsx
// Existing code remains valid
import { Dialog, DialogTrigger, DialogContent } from "@weiui/headless";

// Preferred for new React code
import { Dialog, DialogTrigger, DialogContent } from "@weiui/react/headless";
```

No duplicate generic implementation should be added here. New cross-runtime behavior must be added to `@weiui/core` first.
