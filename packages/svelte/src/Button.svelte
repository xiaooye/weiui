<script lang="ts">
  import type { Snippet } from "svelte";
  import { semanticPart } from "@weiui/core";
  let { children, variant, size, class: className, ...rest } = $props<{ children?: Snippet; variant?: string; size?: string; class?: string; [key: string]: unknown }>();
  let attrs = $derived({ ...rest, ...semanticPart("button", "root", { variant, size }) });
</script>
<button {...attrs} class="wui-button {className ?? ''}">{@render children?.()}</button>
