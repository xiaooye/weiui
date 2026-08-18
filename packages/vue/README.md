# @weiui/vue

Native Vue 3 Composition API renderer for WeiUI. State, ARIA and keyboard semantics come from `@weiui/core`; Vue owns slots, Teleport, refs and `v-model` conventions.

```vue
<script setup lang="ts">
import { Button, Tabs } from "@weiui/vue"
import "@weiui/css"
const tabs = [{ value: "one", label: "One", content: "Content" }]
</script>
<template>
  <Button variant="solid">Save</Button>
  <Tabs v-model="active" :items="tabs" />
</template>
```

Interactive components render WeiUI-owned `data-wui-component`, `data-part` and state attributes and never wrap React or Custom Elements.
