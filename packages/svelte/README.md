# @weiui/svelte

Native Svelte 5 source runtime using runes and bindable state. `@weiui/core` owns state/ARIA/keyboard semantics; Svelte owns binding, snippets and DOM lifecycle.

```svelte
<script lang="ts">
  import { Button, Select } from "@weiui/svelte"
  import "@weiui/css"
  let value = $state("")
  const items = [{ value: "one", label: "One" }]
</script>
<Button variant="solid">Save</Button>
<Select bind:value {items} />
```

The published `svelte` export intentionally ships framework-native `.svelte` source rather than routing through React or Custom Elements.
