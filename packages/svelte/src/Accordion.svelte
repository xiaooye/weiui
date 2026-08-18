<script lang="ts">
  import { createAccordionController } from "@civaria/core"; import { normalizeSvelteProps } from "./internal.js";
  type Item={value:string;label?:string;content?:string;disabled?:boolean};
  let {items=[],value=$bindable<string[]>([]),type="single",id="civ-accordion"}=$props<{items?:Item[];value?:string[];type?:"single"|"multiple";id?:string}>();
  const controller=createAccordionController({id,type,defaultValue:value,onValueChange:next=>value=[...next]}); let state=$state(controller.getState());
  $effect(()=>{const off=controller.subscribe(next=>state=next);return off});
  $effect(()=>{if(value.length!==state.expanded.size||value.some(v=>!state.expanded.has(v)))controller.syncValue(value)});
  function p(kind:"root"|"item"|"trigger"|"content",item?:Item){state;if(kind==="root")return normalizeSvelteProps(controller.getRootProps());if(kind==="item")return normalizeSvelteProps(controller.getItemProps(item!.value,item!.disabled));if(kind==="trigger")return normalizeSvelteProps(controller.getTriggerProps(item!.value,item!.disabled));return normalizeSvelteProps(controller.getContentProps(item!.value))}
</script>
<div {...p("root")} class="civ-accordion">{#each items as item (item.value)}<div {...p("item",item)} class="civ-accordion__item"><button {...p("trigger",item)} class="civ-accordion__trigger">{item.label??item.value}</button><div {...p("content",item)} class="civ-accordion__content">{item.content??""}</div></div>{/each}</div>
