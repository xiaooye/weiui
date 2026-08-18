# Migrating to WeiUI Multi-Runtime

WeiUI is pre-1.0, but the migration preserves existing React imports where practical.

## Existing React applications

Existing styled imports remain valid:

```tsx
import { Button } from "@weiui/react";
```

Heavy integrations are unchanged and remain explicit subpaths:

```tsx
import { Editor } from "@weiui/react/editor";
import { DataTable } from "@weiui/react/data-table";
import { BarChart } from "@weiui/react/chart";
```

## `@weiui/headless`

`@weiui/headless` remains a React compatibility package but is deprecated as an architectural layer. Reusable behavior now belongs to `@weiui/core`.

Old:

```tsx
import { Dialog, DialogTrigger, DialogContent } from "@weiui/headless";
```

Preferred for new React code:

```tsx
import { Dialog, DialogTrigger, DialogContent } from "@weiui/react/headless";
```

No duplicate generic behavior should be added to the compatibility package.

## New native runtimes

```ts
import { Button } from "@weiui/vue";
import { Button as SolidButton } from "@weiui/solid";
```

Svelte:

```svelte
<script lang="ts">
  import { Button } from "@weiui/svelte";
</script>
<Button variant="solid">Save</Button>
```

Elements:

```js
import { defineButton } from "@weiui/elements/button";
defineButton();
```

Registration is explicit. Importing `@weiui/elements` does not globally register anything.

## Styling

Continue importing `@weiui/css`. The visual identity remains CSS-driven and uses stable WeiUI classes/data attributes. This migration is not a visual redesign.

## Icons

The root `@weiui/icons` package is now framework-neutral icon data. Renderer components live on subpaths:

```ts
import { CheckIconData } from "@weiui/icons";
import { Check } from "@weiui/icons/react";
import { Check as VueCheck } from "@weiui/icons/vue";
import { Check as SolidCheck } from "@weiui/icons/solid";
import { Check as SvelteCheck } from "@weiui/icons/svelte";
import { toSvg } from "@weiui/icons/svg";
```

React consumers importing icons from the old root should migrate to `@weiui/icons/react`.

## CLI

```bash
weiui init --framework solid
weiui add button --framework vue
```

Detection covers Next/React, Nuxt/Vue, SolidStart/Solid, SvelteKit/Svelte, Astro and plain HTML. Use the flag when the project is ambiguous.

## What did not change

- Tokens remain framework-neutral.
- CSS remains the canonical visual contract.
- Existing WeiUI product/design language is preserved.
- Cloudflare deployment architecture is unchanged.
- Editor/DataTable/Chart are intentionally React-specific.
