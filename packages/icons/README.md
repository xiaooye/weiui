# @weiui/icons

The canonical icon source is framework-neutral. SVG assets are converted at build time to typed `{ name, viewBox, nodes }` data, then React, Vue, Solid, Svelte and raw-SVG adapters are generated from the same source.

```ts
import { CheckIconData } from "@weiui/icons"
import { toSvg } from "@weiui/icons/svg"
```

```tsx
import { Check } from "@weiui/icons/react"
```

Vue and Solid expose equivalent generated named components from `@weiui/icons/vue` and `@weiui/icons/solid`; Svelte exposes generated native `.svelte` components from `@weiui/icons/svelte`. The neutral root does not require React.
