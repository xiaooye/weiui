import { createEffect, createSignal, createUniqueId, onCleanup } from "solid-js";
import h from "solid-js/h";
import { Portal } from "solid-js/web";
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
  semanticPart,
} from "@weiui/core";

const eventNames = { click: "onClick", keydown: "onKeyDown", pointermove: "onPointerMove", pointerenter: "onPointerEnter", pointerleave: "onPointerLeave", focus: "onFocus", blur: "onBlur" };
const focusableSelector = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
export function normalizeSolidProps(dom = {}) {
  const out = { ...(dom.attributes ?? {}) };
  if (dom.style) out.style = dom.style;
  for (const [name, handler] of Object.entries(dom.listeners ?? {})) out[eventNames[name] ?? `on${name[0].toUpperCase()}${name.slice(1)}`] = handler;
  return out;
}
function bind(controller) { const [revision, setRevision] = createSignal(0); const stop = controller.subscribe(() => setRevision(value => value + 1)); onCleanup(stop); return revision; }
function cls(component, part) { return part === "root" ? `wui-${component}` : `wui-${component}__${part}`; }
function apply(element, dom) {
  for (const [name, value] of Object.entries(dom.attributes ?? {})) {
    if (value === null || value === undefined || value === false) element.removeAttribute(name);
    else if (value === true) element.setAttribute(name, "");
    else if (name === "value" && "value" in element) element.value = String(value);
    else if (name === "checked" && "checked" in element) element.checked = Boolean(value);
    else element.setAttribute(name, String(value));
  }
}
function coreNode(tag, component, part, getProps, revision, children, extra = {}) {
  let node; const initial = normalizeSolidProps(getProps());
  createEffect(() => { revision(); if (node) apply(node, getProps()); });
  return h(tag, { ...initial, ...extra, class: [cls(component, part), extra.class].filter(Boolean).join(" "), ref(value) { node = value; extra.ref?.(value); } }, children);
}
function visual(name, tag = "div") { const component = name.toLowerCase(); return function WeiVisual(props = {}) { return h(tag, { ...props, ...semanticPart(component, "root", { variant: props.variant, size: props.size }), class: [cls(component, "root"), props.variant && `wui-${component}--${props.variant}`, props.size && `wui-${component}--${props.size}`, props.class].filter(Boolean).join(" ") }, props.children); }; }
export const Button = visual("Button", "button"); export const Badge = visual("Badge", "span"); export const Card = visual("Card"); export const Divider = visual("Divider", "hr"); export const Skeleton = visual("Skeleton"); export const Spinner = visual("Spinner", "span"); export const Container = visual("Container"); export const Stack = visual("Stack"); export const Grid = visual("Grid"); export const AspectRatio = visual("AspectRatio");
function idFor(name, provided) { return provided ?? `wui-${name}-${createUniqueId()}`; }

export function Accordion(props = {}) {
  const controller = createAccordionController({ id: idFor("accordion", props.id), type: props.type ?? "single", defaultValue: props.value ?? props.defaultValue ?? [], onValueChange: props.onValueChange }); const revision = bind(controller);
  createEffect(() => { if (props.value) controller.syncValue(props.value); });
  return coreNode("div", "accordion", "root", controller.getRootProps, revision, () => (props.items ?? []).map(item => coreNode("div", "accordion", "item", () => controller.getItemProps(item.value, item.disabled), revision, [coreNode("button", "accordion", "trigger", () => controller.getTriggerProps(item.value, item.disabled), revision, item.label ?? item.value), coreNode("div", "accordion", "content", () => controller.getContentProps(item.value), revision, item.content)])));
}

function disclosure(name, createController, props, renderContent) {
  const component = name.toLowerCase(); const controller = createController({ id: idFor(component, props.id), defaultOpen: props.open ?? props.defaultOpen ?? false, onOpenChange: props.onOpenChange }); const revision = bind(controller);
  createEffect(() => { if (props.open !== undefined) controller.syncOpen(props.open); });
  return coreNode("div", component, "root", controller.getRootProps, revision, [coreNode("button", component, "trigger", controller.getTriggerProps, revision, props.trigger ?? "Open", { ref: props.triggerRef }), () => renderContent(controller, revision)]);
}
export function Dialog(props = {}) {
  let contentEl; let previousFocus = null; let wasOpen = false;
  return disclosure("Dialog", createDialogController, props, (controller, revision) => {
    createEffect(() => {
      revision(); const open = controller.getState().open;
      if (typeof document !== "undefined" && open && !wasOpen) { previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null; queueMicrotask(() => { const targets = contentEl ? [...contentEl.querySelectorAll(focusableSelector)] : []; if (!focusFirst(targets) && contentEl) contentEl.focus(); }); }
      if (!open && wasOpen && previousFocus?.focus) { previousFocus.focus({ preventScroll: true }); previousFocus = null; }
      wasOpen = open;
    });
    if (!controller.getState().open) return null;
    const trap = event => { if (event.key !== "Tab" || !contentEl) return; const targets = [...contentEl.querySelectorAll(focusableSelector)]; const active = targets.indexOf(document.activeElement); trapTabKey(event, targets, active < 0 ? (event.shiftKey ? 0 : -1) : active); };
    const panel = coreNode("div", "dialog", "content", controller.getContentProps, revision, [props.title && coreNode("h2", "dialog", "title", controller.getTitleProps, revision, props.title), props.description && coreNode("p", "dialog", "description", controller.getDescriptionProps, revision, props.description), props.children, coreNode("button", "dialog", "close", controller.getCloseProps, revision, props.closeLabel ?? "Close")], { ref: value => { contentEl = value; }, tabIndex: -1, onKeyDown: trap });
    const body = [coreNode("div", "dialog", "overlay", controller.getOverlayProps, revision), panel]; return props.portal === false ? body : h(Portal, {}, body);
  });
}
export function Popover(props = {}) { return disclosure("Popover", createPopoverController, props, (controller, revision) => controller.getState().open ? coreNode("div", "popover", "content", controller.getContentProps, revision, [props.children, coreNode("button", "popover", "close", controller.getCloseProps, revision, props.closeLabel ?? "Close")]) : null); }

export function Menu(props = {}) {
  const controller = createMenuController({ id: idFor("menu", props.id), onOpenChange: props.onOpenChange }); const revision = bind(controller); createEffect(() => controller.setItems(props.items ?? []));
  return coreNode("div", "menu", "root", controller.getRootProps, revision, [coreNode("button", "menu", "trigger", controller.getTriggerProps, revision, props.trigger ?? "Menu"), coreNode("div", "menu", "content", controller.getContentProps, revision, () => (props.items ?? []).map((item, index) => { const base = controller.getItemProps(index); const normalized = normalizeSolidProps(base); const click = normalized.onClick; return h("div", { ...normalized, class: cls("menu", "item"), onClick: event => { click?.(event); if (!item.disabled) props.onSelect?.(item.value); } }, item.label ?? item.value); }))]);
}

export function Select(props = {}) {
  const controller = createSelectController({ id: idFor("select", props.id), defaultValue: props.value ?? props.defaultValue ?? "", onValueChange: props.onValueChange, onOpenChange: props.onOpenChange }); const revision = bind(controller);
  createEffect(() => { controller.setItems(props.items ?? []); if (props.value !== undefined) controller.syncValue(props.value); });
  const selectedLabel = () => (props.items ?? []).find(item => item.value === controller.getState().value)?.label ?? props.placeholder ?? "Select…";
  return coreNode("div", "select", "root", controller.getRootProps, revision, [coreNode("button", "select", "trigger", controller.getTriggerProps, revision, selectedLabel, { disabled: props.disabled, "aria-required": props.required || undefined }), coreNode("div", "select", "content", controller.getContentProps, revision, () => (props.items ?? []).map((item, index) => coreNode("div", "select", "item", () => controller.getItemProps(index), revision, item.label ?? item.value))), coreNode("input", "select", "hiddenInput", () => controller.getHiddenInputProps(props.name, props.required, props.disabled), revision)]);
}

export function Tabs(props = {}) {
  const controller = createTabsController({ id: idFor("tabs", props.id), defaultValue: props.value ?? props.defaultValue ?? "", orientation: props.orientation ?? "horizontal", onValueChange: props.onValueChange }); const revision = bind(controller); createEffect(() => { if (props.value !== undefined) controller.syncValue(props.value); });
  return coreNode("div", "tabs", "root", controller.getRootProps, revision, [coreNode("div", "tabs", "list", controller.getListProps, revision, () => (props.items ?? []).map(item => coreNode("button", "tabs", "trigger", () => controller.getTriggerProps(item.value, item.disabled), revision, item.label ?? item.value))), () => (props.items ?? []).map(item => coreNode("div", "tabs", "content", () => controller.getContentProps(item.value), revision, item.content))]);
}

export function Tooltip(props = {}) { const controller = createTooltipController({ id: idFor("tooltip", props.id), delay: props.delay ?? 0, onOpenChange: props.onOpenChange }); const revision = bind(controller); return coreNode("span", "tooltip", "root", controller.getRootProps, revision, [coreNode("span", "tooltip", "trigger", controller.getTriggerProps, revision, props.children, { tabIndex: 0 }), coreNode("span", "tooltip", "content", controller.getContentProps, revision, props.content)]); }

export function Combobox(props = {}) {
  const controller = createComboboxController({ id: idFor("combobox", props.id), defaultValue: props.value ?? props.defaultValue ?? "", defaultInputValue: props.inputValue ?? "", onValueChange: props.onValueChange, onInputValueChange: props.onInputValueChange, onOpenChange: props.onOpenChange }); const revision = bind(controller);
  createEffect(() => { controller.setItems(props.items ?? []); if (props.value !== undefined) controller.syncValue(props.value); if (props.inputValue !== undefined) controller.syncInputValue(props.inputValue); });
  return coreNode("div", "combobox", "root", controller.getRootProps, revision, [coreNode("input", "combobox", "input", controller.getInputProps, revision, undefined, { placeholder: props.placeholder, disabled: props.disabled, required: props.required, "aria-required": props.required || undefined, onInput: event => controller.setInputValue(event.currentTarget.value) }), coreNode("div", "combobox", "content", controller.getContentProps, revision, () => (props.items ?? []).map((item, index) => coreNode("div", "combobox", "item", () => controller.getItemProps(index), revision, item.label ?? item.value))), coreNode("input", "combobox", "hiddenInput", () => controller.getHiddenInputProps(props.name, props.required, props.disabled), revision)]);
}

function choice(name, createController, props) {
  const component = name.toLowerCase(); const controller = createController({ id: idFor(component, props.id), defaultChecked: props.checked ?? props.defaultChecked ?? false, disabled: props.disabled, onCheckedChange: props.onCheckedChange }); const revision = bind(controller); createEffect(() => { if (props.checked !== undefined) controller.syncChecked(props.checked); });
  return coreNode("label", component, "root", controller.getRootProps, revision, [coreNode("span", component, "control", controller.getControlProps, revision), coreNode("input", component, "hiddenInput", () => controller.getHiddenInputProps(props.name, props.value ?? "on", props.required), revision), props.label ?? props.children]);
}
export function Checkbox(props = {}) { return choice("Checkbox", createCheckboxController, props); }
export function Switch(props = {}) { return choice("Switch", createSwitchController, props); }
