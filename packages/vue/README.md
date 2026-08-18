# @civaria/vue

Native Vue 3 Composition API renderer for Civaria. State, ARIA and keyboard semantics come from `@civaria/core`; Vue owns slots, Teleport, refs and `v-model` conventions.

```vue
<script setup lang="ts">
import { Button, Tabs } from "@civaria/vue"
import "@civaria/css"
const tabs = [{ value: "one", label: "One", content: "Content" }]
</script>
<template>
  <Button variant="solid">Save</Button>
  <Tabs v-model="active" :items="tabs" />
</template>
```

Interactive components render Civaria-owned `data-civaria-component`, `data-part` and state attributes and never wrap React or Custom Elements.
