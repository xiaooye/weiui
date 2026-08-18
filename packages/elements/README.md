# @weiui/elements

Native, light-DOM Custom Elements for plain HTML, Astro and framework-agnostic distribution. Elements use the same `@weiui/core` controllers and `@weiui/css` anatomy as native framework adapters. Registration is explicit and duplicate-safe; importing the package under Node does not touch `window`, `document`, `HTMLElement` or `customElements` unsafely.

```js
import { defineButton, defineDialog } from "@weiui/elements"
import "@weiui/css"
defineButton()
defineDialog()
```

```html
<wui-button variant="solid">Save</wui-button>
<wui-dialog trigger="Open" title="Example">Dialog body</wui-dialog>
```

Complex values such as menu/select items are set as properties (`element.items = [...]`) rather than JSON attributes. `defineAll()` is available as an opt-in convenience; root import has no registration side effect.
