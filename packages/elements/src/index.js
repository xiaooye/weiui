import {
  createAccordionController,
  createCheckboxController,
  createComboboxController,
  createDialogController,
  createMenuController,
  createPopoverController,
  createSelectController,
  createSwitchController,
  createTabsController,
  createTooltipController,
  focusFirst,
  trapTabKey,
} from "@civaria/core";

const HTMLElementBase = typeof HTMLElement === "undefined" ? class {} : HTMLElement;
let sequence = 0;
const listenerState = new WeakMap();
function elementId(element, component) { return element.id || element.getAttribute?.("data-civaria-id") || `civ-${component}-${++sequence}`; }
function className(component, part) { return part === "root" ? `civ-${component}` : `civ-${component}__${part}`; }
function applyDOMProps(element, dom = {}) {
  if (!element?.setAttribute) return;
  for (const [name, handler] of listenerState.get(element) ?? []) element.removeEventListener(name, handler);
  const listeners = [];
  for (const [name, value] of Object.entries(dom.attributes ?? {})) {
    if (value === false || value === null || value === undefined) { element.removeAttribute(name); if (name in element && typeof element[name] === "boolean") element[name] = false; }
    else if (value === true) { element.setAttribute(name, ""); if (name in element && typeof element[name] === "boolean") element[name] = true; }
    else if (name === "value" && "value" in element) element.value = String(value);
    else element.setAttribute(name, String(value));
  }
  for (const [name, handler] of Object.entries(dom.listeners ?? {})) { const listener = event => handler(event); element.addEventListener(name, listener); listeners.push([name, listener]); }
  if (dom.style) Object.assign(element.style, dom.style);
  listenerState.set(element, listeners);
}
function node(tag, component, part, dom, text) { const element = document.createElement(tag); element.className = className(component, part); applyDOMProps(element, dom); if (text !== undefined && text !== null) element.textContent = String(text); return element; }
function emit(element, type, detail) { element.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true })); }
function trapTab(event, container) {
  if (event.key !== "Tab") return;
  const targets = [...container.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(item => item.getAttribute("aria-hidden") !== "true");
  if (targets.length === 0) { event.preventDefault(); container.focus(); return; }
  const active = targets.indexOf(document.activeElement);
  trapTabKey(event, targets, active < 0 ? (event.shiftKey ? 0 : -1) : active);
}
class ControllerElement extends HTMLElementBase {
  _controller; _unsubscribe;
  disconnectedCallback() { this._unsubscribe?.(); this._unsubscribe = undefined; }
  watch(controller) { this._unsubscribe?.(); this._controller = controller; this._unsubscribe = controller.subscribe(() => this.render()); }
}
function visualElement(component, options = {}) {
  return class extends HTMLElementBase { connectedCallback() { this.setAttribute("data-civaria-component", component); this.setAttribute("data-part", "root"); this.classList.add(className(component, "root")); const variant=this.getAttribute("variant"),size=this.getAttribute("size"); if(variant)this.setAttribute("data-variant",variant);if(size)this.setAttribute("data-size",size);options.connect?.call(this); } };
}
export class CivButtonElement extends visualElement("button", { connect() { if (this.querySelector(':scope > [data-part="root"]')) return; const button=document.createElement("button");button.className="civ-button";button.dataset.civComponent="button";button.dataset.part="root";const variant=this.getAttribute("variant"),size=this.getAttribute("size");if(variant)button.dataset.variant=variant;if(size)button.dataset.size=size;if(this.hasAttribute("disabled"))button.disabled=true;while(this.firstChild)button.append(this.firstChild);this.append(button); } }) {}
export class CivBadgeElement extends visualElement("badge") {} export class CivCardElement extends visualElement("card") {} export class CivDividerElement extends visualElement("divider",{connect(){this.setAttribute("role","separator")}}) {} export class CivSkeletonElement extends visualElement("skeleton") {} export class CivSpinnerElement extends visualElement("spinner",{connect(){this.setAttribute("role","status")}}) {} export class CivContainerElement extends visualElement("container") {} export class CivStackElement extends visualElement("stack") {} export class CivGridElement extends visualElement("grid") {} export class CivAspectRatioElement extends visualElement("aspectratio") {}

export class CivAccordionElement extends ControllerElement {
  _items=[]; get items(){return this._items} set items(value){this._items=Array.isArray(value)?value:[];if(this.isConnected)this.setup()}
  connectedCallback(){this.setup()}
  setup(){const c=createAccordionController({id:elementId(this,"accordion"),type:this.getAttribute("type")==="multiple"?"multiple":"single",defaultValue:[],onValueChange:value=>emit(this,"valuechange",{value:[...value]})});this.watch(c);this.render()}
  render(){const c=this._controller;if(!c)return;this.replaceChildren();const root=node("div","accordion","root",c.getRootProps());for(const item of this._items){const itemEl=node("div","accordion","item",c.getItemProps(item.value,item.disabled));itemEl.append(node("button","accordion","trigger",c.getTriggerProps(item.value,item.disabled),item.label??item.value),node("div","accordion","content",c.getContentProps(item.value),item.content??""));root.append(itemEl)}this.append(root)}
}
export class CivDialogElement extends ControllerElement {
  _contentNodes;_previousFocus=null;
  connectedCallback(){if(!this._contentNodes)this._contentNodes=[...this.childNodes];const c=createDialogController({id:elementId(this,"dialog"),defaultOpen:this.hasAttribute("open"),onOpenChange:open=>{this.toggleAttribute("open",open);emit(this,"openchange",{open})}});this.watch(c);this.render()}
  render(){const c=this._controller;if(!c)return;const wasOpen=!!this.querySelector('[data-part="content"]');this.replaceChildren();const root=node("div","dialog","root",c.getRootProps());root.append(node("button","dialog","trigger",c.getTriggerProps(),this.getAttribute("trigger")??"Open"));if(c.getState().open){if(!wasOpen)this._previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;root.append(node("div","dialog","overlay",c.getOverlayProps()));const content=node("div","dialog","content",c.getContentProps());content.tabIndex=-1;const title=this.getAttribute("title"),description=this.getAttribute("description");if(title)content.append(node("h2","dialog","title",c.getTitleProps(),title));if(description)content.append(node("p","dialog","description",c.getDescriptionProps(),description));for(const child of this._contentNodes??[])content.append(child);content.append(node("button","dialog","close",c.getCloseProps(),this.getAttribute("close-label")??"Close"));content.addEventListener("keydown",event=>trapTab(event,content));root.append(content);queueMicrotask(()=>{const targets=[...content.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];if(!focusFirst(targets))content.focus()})}else if(wasOpen&&this._previousFocus){queueMicrotask(()=>this._previousFocus?.focus());this._previousFocus=null}this.append(root)}
}
export class CivMenuElement extends ControllerElement {
  _items=[];get items(){return this._items}set items(value){this._items=Array.isArray(value)?value:[];this._controller?.setItems(this._items);if(this.isConnected)this.render()}
  connectedCallback(){const c=createMenuController({id:elementId(this,"menu"),onOpenChange:open=>emit(this,"openchange",{open})});c.setItems(this._items);this.watch(c);this.render()}
  render(){const c=this._controller;if(!c)return;this.replaceChildren();const root=node("div","menu","root",c.getRootProps());root.append(node("button","menu","trigger",c.getTriggerProps(),this.getAttribute("trigger")??"Menu"));const content=node("div","menu","content",c.getContentProps());this._items.forEach((item,index)=>{const el=node("div","menu","item",c.getItemProps(index),item.label??item.value);el.addEventListener("click",()=>{if(!item.disabled)emit(this,"select",{value:item.value})});content.append(el)});root.append(content);this.append(root)}
}
class DisclosureContentElement extends ControllerElement {
  _contentNodes;createController(){throw new Error("createController must be implemented")}componentName(){return"popover"}
  connectedCallback(){if(!this._contentNodes)this._contentNodes=[...this.childNodes];const c=this.createController();this.watch(c);this.render()}
  render(){const component=this.componentName(),c=this._controller;if(!c)return;this.replaceChildren();const root=node("div",component,"root",c.getRootProps());root.append(node("button",component,"trigger",c.getTriggerProps(),this.getAttribute("trigger")??"Open"));if(c.getState().open){const content=node("div",component,"content",c.getContentProps());for(const child of this._contentNodes??[])content.append(child);if(typeof c.getCloseProps==="function")content.append(node("button",component,"close",c.getCloseProps(),this.getAttribute("close-label")??"Close"));root.append(content)}this.append(root)}
}
export class CivPopoverElement extends DisclosureContentElement {componentName(){return"popover"}createController(){return createPopoverController({id:elementId(this,"popover"),defaultOpen:this.hasAttribute("open"),onOpenChange:open=>{this.toggleAttribute("open",open);emit(this,"openchange",{open})}})}}
export class CivSelectElement extends ControllerElement {
  static formAssociated = true; _items=[]; _internals;
  constructor(){super();this._internals=this.attachInternals?.()}
  static get observedAttributes(){return ["value","name","required","disabled"]}
  attributeChangedCallback(name,_old,value){if(name==="value"&&this._controller)this._controller.syncValue(value??"");if(this.isConnected)this._syncFormValue()}
  get items(){return this._items}set items(value){this._items=Array.isArray(value)?value:[];this._controller?.setItems(this._items);if(this.isConnected)this.render()}
  get value(){return this._controller?.getState().value??this.getAttribute("value")??""}set value(value){this.setAttribute("value",value??"")}
  _syncFormValue(){const value=this.value;const disabled=this.hasAttribute("disabled");this._internals?.setFormValue(disabled?null:value);if(this._internals?.setValidity){const missing=this.hasAttribute("required")&&!value;this._internals.setValidity(missing?{valueMissing:true}:{},missing?"Please select an option.":"")}}
  connectedCallback(){const c=createSelectController({id:elementId(this,"select"),defaultValue:this.getAttribute("value")??"",onValueChange:value=>{this.setAttribute("value",value);this._syncFormValue();emit(this,"valuechange",{value})}});c.setItems(this._items);this.watch(c);this._syncFormValue();this.render()}
  render(){const c=this._controller;if(!c)return;this.replaceChildren();const root=node("div","select","root",c.getRootProps()),selected=this._items.find(item=>item.value===c.getState().value),trigger=node("button","select","trigger",c.getTriggerProps(),selected?.label??this.getAttribute("placeholder")??"Select…");trigger.disabled=this.hasAttribute("disabled");if(this.hasAttribute("required"))trigger.setAttribute("aria-required","true");root.append(trigger);const content=node("div","select","content",c.getContentProps());this._items.forEach((item,index)=>content.append(node("div","select","item",c.getItemProps(index),item.label??item.value)));root.append(content);if(!this._internals&&this.getAttribute("name"))root.append(node("input","select","hiddenInput",c.getHiddenInputProps(this.getAttribute("name")??undefined,this.hasAttribute("required"),this.hasAttribute("disabled"))));this.append(root)}
}
export class CivTabsElement extends ControllerElement {
  _items=[];get items(){return this._items}set items(value){this._items=Array.isArray(value)?value:[];if(this.isConnected)this.render()}
  connectedCallback(){const c=createTabsController({id:elementId(this,"tabs"),defaultValue:this.getAttribute("value")??this._items[0]?.value??"",orientation:this.getAttribute("orientation")==="vertical"?"vertical":"horizontal",onValueChange:value=>{this.setAttribute("value",value);emit(this,"valuechange",{value})}});this.watch(c);this.render()}
  render(){const c=this._controller;if(!c)return;this.replaceChildren();const root=node("div","tabs","root",c.getRootProps()),list=node("div","tabs","list",c.getListProps());for(const item of this._items)list.append(node("button","tabs","trigger",c.getTriggerProps(item.value,item.disabled),item.label??item.value));root.append(list);for(const item of this._items)root.append(node("div","tabs","content",c.getContentProps(item.value),item.content??""));this.append(root)}
}
export class CivTooltipElement extends ControllerElement {
  _triggerNodes;connectedCallback(){if(!this._triggerNodes)this._triggerNodes=[...this.childNodes];const c=createTooltipController({id:elementId(this,"tooltip"),delay:Number(this.getAttribute("delay")??0),onOpenChange:open=>emit(this,"openchange",{open})});this.watch(c);this.render()}
  render(){const c=this._controller;if(!c)return;this.replaceChildren();const root=node("span","tooltip","root",c.getRootProps()),trigger=node("span","tooltip","trigger",c.getTriggerProps());trigger.tabIndex=0;for(const child of this._triggerNodes??[])trigger.append(child);root.append(trigger,node("span","tooltip","content",c.getContentProps(),this.getAttribute("content")??""));this.append(root)}
}
export class CivComboboxElement extends ControllerElement {
  static formAssociated = true; _items=[]; _internals;
  constructor(){super();this._internals=this.attachInternals?.()}
  static get observedAttributes(){return ["value","name","required","disabled"]}
  attributeChangedCallback(name,_old,value){if(name==="value"&&this._controller)this._controller.syncValue(value??"");if(this.isConnected)this._syncFormValue()}
  get items(){return this._items}set items(value){this._items=Array.isArray(value)?value:[];this._controller?.setItems(this._items);if(this.isConnected)this.render()}
  get value(){return this._controller?.getState().value??this.getAttribute("value")??""}set value(value){this.setAttribute("value",value??"")}
  _syncFormValue(){const value=this.value;const disabled=this.hasAttribute("disabled");this._internals?.setFormValue(disabled?null:value);if(this._internals?.setValidity){const missing=this.hasAttribute("required")&&!value;this._internals.setValidity(missing?{valueMissing:true}:{},missing?"Please select an option.":"")}}
  connectedCallback(){const c=createComboboxController({id:elementId(this,"combobox"),defaultValue:this.getAttribute("value")??"",defaultInputValue:this.getAttribute("input-value")??"",onValueChange:value=>{this.setAttribute("value",value);this._syncFormValue();emit(this,"valuechange",{value})},onInputValueChange:value=>{this.setAttribute("input-value",value);emit(this,"inputvaluechange",{value})}});c.setItems(this._items);this.watch(c);this._syncFormValue();this.render()}
  render(){const c=this._controller;if(!c)return;this.replaceChildren();const root=node("div","combobox","root",c.getRootProps()),input=node("input","combobox","input",c.getInputProps());input.placeholder=this.getAttribute("placeholder")??"";input.disabled=this.hasAttribute("disabled");input.required=this.hasAttribute("required");input.addEventListener("input",event=>c.setInputValue(event.currentTarget.value));const content=node("div","combobox","content",c.getContentProps());this._items.forEach((item,index)=>content.append(node("div","combobox","item",c.getItemProps(index),item.label??item.value)));root.append(input,content);if(!this._internals&&this.getAttribute("name"))root.append(node("input","combobox","hiddenInput",c.getHiddenInputProps(this.getAttribute("name")??undefined,this.hasAttribute("required"),this.hasAttribute("disabled"))));this.append(root)}
}
function choiceElement(component,createController){return class extends ControllerElement{connectedCallback(){const c=createController({id:elementId(this,component),defaultChecked:this.hasAttribute("checked"),disabled:this.hasAttribute("disabled"),onCheckedChange:checked=>{this.toggleAttribute("checked",checked);emit(this,"checkedchange",{checked})}});this.watch(c);this.render()}render(){const c=this._controller;if(!c)return;this.replaceChildren();const label=document.createElement("label");label.dataset.civComponent=component;label.dataset.part="root";label.className=className(component,"root");const input=document.createElement("input");input.type="checkbox";input.className=className(component,"control");input.dataset.civComponent=component;input.dataset.part="control";input.checked=c.getState().checked;input.disabled=this.hasAttribute("disabled");if(component==="switch")input.setAttribute("role","switch");const name=this.getAttribute("name");if(name)input.name=name;input.value=this.getAttribute("value")??"on";input.addEventListener("change",()=>c.setChecked(input.checked));label.append(input,document.createTextNode(this.getAttribute("label")??""));this.append(label)}}}
export class CivCheckboxElement extends choiceElement("checkbox",createCheckboxController){} export class CivSwitchElement extends choiceElement("switch",createSwitchController){}
const definitions=[["civ-button",CivButtonElement],["civ-badge",CivBadgeElement],["civ-card",CivCardElement],["civ-divider",CivDividerElement],["civ-skeleton",CivSkeletonElement],["civ-spinner",CivSpinnerElement],["civ-container",CivContainerElement],["civ-stack",CivStackElement],["civ-grid",CivGridElement],["civ-aspect-ratio",CivAspectRatioElement],["civ-accordion",CivAccordionElement],["civ-dialog",CivDialogElement],["civ-menu",CivMenuElement],["civ-popover",CivPopoverElement],["civ-select",CivSelectElement],["civ-tabs",CivTabsElement],["civ-tooltip",CivTooltipElement],["civ-combobox",CivComboboxElement],["civ-checkbox",CivCheckboxElement],["civ-switch",CivSwitchElement]];
function define(name,constructor){if(typeof customElements==="undefined")return;if(!customElements.get(name))customElements.define(name,constructor)}
export const defineButton=()=>define("civ-button",CivButtonElement);export const defineAccordion=()=>define("civ-accordion",CivAccordionElement);export const defineDialog=()=>define("civ-dialog",CivDialogElement);export const defineMenu=()=>define("civ-menu",CivMenuElement);export const definePopover=()=>define("civ-popover",CivPopoverElement);export const defineSelect=()=>define("civ-select",CivSelectElement);export const defineTabs=()=>define("civ-tabs",CivTabsElement);export const defineTooltip=()=>define("civ-tooltip",CivTooltipElement);export const defineCombobox=()=>define("civ-combobox",CivComboboxElement);export const defineCheckbox=()=>define("civ-checkbox",CivCheckboxElement);export const defineSwitch=()=>define("civ-switch",CivSwitchElement);export function defineAll(){for(const [name,constructor] of definitions)define(name,constructor)}export {applyDOMProps as normalizeElementProps};
