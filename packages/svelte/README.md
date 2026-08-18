# @civaria/svelte

Native Svelte 5 source runtime using runes and bindable state. `@civaria/core` owns state/ARIA/keyboard semantics; Svelte owns binding, snippets and DOM lifecycle.

```svelte
<script lang="ts">
  import { Button, Select } from "@civaria/svelte"
  import "@civaria/css"
  let value = $state("")
  const items = [{ value: "one", label: "One" }]
</script>
<Button variant="solid">Save</Button>
<Select bind:value {items} />
```

The published `svelte` export intentionally ships framework-native `.svelte` source rather than routing through React or Custom Elements.
