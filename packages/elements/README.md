# @civaria/elements

Native, light-DOM Custom Elements for plain HTML, Astro and framework-agnostic distribution. Elements use the same `@civaria/core` controllers and `@civaria/css` anatomy as native framework adapters. Registration is explicit and duplicate-safe; importing the package under Node does not touch `window`, `document`, `HTMLElement` or `customElements` unsafely.

```js
import { defineButton, defineDialog } from "@civaria/elements"
import "@civaria/css"
defineButton()
defineDialog()
```

```html
<civ-button variant="solid">Save</civ-button>
<civ-dialog trigger="Open" title="Example">Dialog body</civ-dialog>
```

Complex values such as menu/select items are set as properties (`element.items = [...]`) rather than JSON attributes. `defineAll()` is available as an opt-in convenience; root import has no registration side effect.
