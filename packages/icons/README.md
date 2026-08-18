# @civaria/icons

The canonical icon source is framework-neutral. SVG assets are converted at build time to typed `{ name, viewBox, nodes }` data, then React, Vue, Solid, Svelte and raw-SVG adapters are generated from the same source.

```ts
import { CheckIconData } from "@civaria/icons"
import { toSvg } from "@civaria/icons/svg"
```

```tsx
import { Check } from "@civaria/icons/react"
```

Vue and Solid expose equivalent generated named components from `@civaria/icons/vue` and `@civaria/icons/solid`; Svelte exposes generated native `.svelte` components from `@civaria/icons/svelte`. The neutral root does not require React.
