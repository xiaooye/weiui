# @weiui/solid

Native SolidJS runtime for WeiUI. Controllers from `@weiui/core` are observed through Solid signals, IDs use `createUniqueId`, DOM updates use native refs/effects, and modal rendering uses Solid's `Portal`.

```tsx
import { Button, Dialog } from "@weiui/solid"
import "@weiui/css"

<Button variant="solid">Save</Button>
<Dialog trigger="Open" title="Example">Hello</Dialog>
```

No React, Vue, Svelte or Custom Element wrapper is used.
