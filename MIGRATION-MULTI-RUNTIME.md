# Migrating to Civaria Multi-Runtime

Civaria is pre-1.0, but the migration preserves existing React imports where practical.

## Existing React applications

Existing styled imports remain valid:

```tsx
import { Button } from "civaria";
```

Heavy integrations are unchanged and remain explicit subpaths:

```tsx
import { Editor } from "civaria/editor";
import { DataTable } from "civaria/data-table";
import { BarChart } from "civaria/chart";
```

## `@civaria/headless`

`@civaria/headless` remains a React compatibility package but is deprecated as an architectural layer. Reusable behavior now belongs to `@civaria/core`.

Old:

```tsx
import { Dialog, DialogTrigger, DialogContent } from "@civaria/headless";
```

Preferred for new React code:

```tsx
import { Dialog, DialogTrigger, DialogContent } from "civaria/headless";
```

No duplicate generic behavior should be added to the compatibility package.

## New native runtimes

```ts
import { Button } from "@civaria/vue";
import { Button as SolidButton } from "@civaria/solid";
```

Svelte:

```svelte
<script lang="ts">
  import { Button } from "@civaria/svelte";
</script>
<Button variant="solid">Save</Button>
```

Elements:

```js
import { defineButton } from "@civaria/elements/button";
defineButton();
```

Registration is explicit. Importing `@civaria/elements` does not globally register anything.

## Styling

Continue importing `@civaria/css`. The visual identity remains CSS-driven and uses stable Civaria classes/data attributes. This migration is not a visual redesign.

## Icons

The root `@civaria/icons` package is now framework-neutral icon data. Renderer components live on subpaths:

```ts
import { CheckIconData } from "@civaria/icons";
import { Check } from "@civaria/icons/react";
import { Check as VueCheck } from "@civaria/icons/vue";
import { Check as SolidCheck } from "@civaria/icons/solid";
import { Check as SvelteCheck } from "@civaria/icons/svelte";
import { toSvg } from "@civaria/icons/svg";
```

React consumers importing icons from the old root should migrate to `@civaria/icons/react`.

## CLI

```bash
civaria init --framework solid
civaria add button --framework vue
```

Detection covers Next/React, Nuxt/Vue, SolidStart/Solid, SvelteKit/Svelte, Astro and plain HTML. Use the flag when the project is ambiguous.

## What did not change

- Tokens remain framework-neutral.
- CSS remains the canonical visual contract.
- Existing Civaria product/design language is preserved.
- Cloudflare deployment architecture is unchanged.
- Editor/DataTable/Chart are intentionally React-specific.
