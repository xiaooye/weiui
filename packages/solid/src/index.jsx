import { createEffect, createSignal, createUniqueId, onCleanup } from "solid-js";
import { Dynamic, Portal, Show } from "solid-js/web";
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
} from "@civaria/core";

const eventNames = { click: "onClick", keydown: "onKeyDown", pointermove: "onPointerMove", pointerenter: "onPointerEnter", pointerleave: "onPointerLeave", focus: "onFocus", blur: "onBlur" };
const focusableSelector = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function normalizeSolidProps(dom = {}) {
  const out = { ...(dom.attributes ?? {}) };
  if (dom.style) out.style = dom.style;
  for (const [name, handler] of Object.entries(dom.listeners ?? {})) out[eventNames[name] ?? `on${name[0].toUpperCase()}${name.slice(1)}`] = handler;
  return out;
}
function bind(controller) {
  const [revision, setRevision] = createSignal(0);
  const stop = controller.subscribe(() => setRevision(value => value + 1));
  onCleanup(stop);
  return revision;
}
function p(revision, getter) { revision(); return normalizeSolidProps(getter()); }
function cls(component, part) { return part === "root" ? `civ-${component}` : `civ-${component}__${part}`; }
function idFor(name, provided) { return provided ?? `civ-${name}-${createUniqueId()}`; }

function visual(name, tag = "div") {
  const component = name.toLowerCase();
  return function WeiVisual(props = {}) {
    const className = () => [cls(component, "root"), props.variant && `civ-${component}--${props.variant}`, props.size && `civ-${component}--${props.size}`, props.class].filter(Boolean).join(" ");
    return <Dynamic component={tag} {...props} {...semanticPart(component, "root", { variant: props.variant, size: props.size })} class={className()}>{props.children}</Dynamic>;
  };
}
export const Button = visual("Button", "button");
export const Badge = visual("Badge", "span");
export const Card = visual("Card");
export const Divider = visual("Divider", "hr");
export const Skeleton = visual("Skeleton");
export const Spinner = visual("Spinner", "span");
export const Container = visual("Container");
export const Stack = visual("Stack");
export const Grid = visual("Grid");
export const AspectRatio = visual("AspectRatio");

export function Accordion(props = {}) {
  const controller = createAccordionController({ id: idFor("accordion", props.id), type: props.type ?? "single", defaultValue: props.value ?? props.defaultValue ?? [], onValueChange: props.onValueChange });
  const revision = bind(controller);
  createEffect(() => { if (props.value) controller.syncValue(props.value); });
  return <div {...p(revision, controller.getRootProps)} class={cls("accordion", "root")}>
    {(props.items ?? []).map(item => <div {...p(revision, () => controller.getItemProps(item.value, item.disabled))} class={cls("accordion", "item")}>
      <button {...p(revision, () => controller.getTriggerProps(item.value, item.disabled))} class={cls("accordion", "trigger")}>{item.label ?? item.value}</button>
      <div {...p(revision, () => controller.getContentProps(item.value))} class={cls("accordion", "content")}>{item.content}</div>
    </div>)}
  </div>;
}

export function Dialog(props = {}) {
  const controller = createDialogController({ id: idFor("dialog", props.id), defaultOpen: props.open ?? props.defaultOpen ?? false, onOpenChange: props.onOpenChange });
  const revision = bind(controller);
  let contentEl; let previousFocus = null; let wasOpen = false;
  createEffect(() => { if (props.open !== undefined) controller.syncOpen(props.open); });
  createEffect(() => {
    revision(); const open = controller.getState().open;
    if (typeof document !== "undefined" && open && !wasOpen) {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      queueMicrotask(() => { const targets = contentEl ? [...contentEl.querySelectorAll(focusableSelector)] : []; if (!focusFirst(targets) && contentEl) contentEl.focus(); });
    }
    if (typeof document !== "undefined" && !open && wasOpen && previousFocus?.focus) { previousFocus.focus({ preventScroll: true }); previousFocus = null; }
    wasOpen = open;
  });
  const panel = () => <>
    <div {...p(revision, controller.getOverlayProps)} class={cls("dialog", "overlay")} />
    <div ref={contentEl} {...p(revision, controller.getContentProps)} class={cls("dialog", "content")} tabindex="-1" onKeyDown={event => {
      controller.getContentProps().listeners?.keydown?.(event);
      if (event.key !== "Tab" || !contentEl) return;
      const targets = [...contentEl.querySelectorAll(focusableSelector)]; const active = targets.indexOf(document.activeElement);
      trapTabKey(event, targets, active < 0 ? (event.shiftKey ? 0 : -1) : active);
    }}>
      <Show when={props.title}><h2 {...p(revision, controller.getTitleProps)} class={cls("dialog", "title")}>{props.title}</h2></Show>
      <Show when={props.description}><p {...p(revision, controller.getDescriptionProps)} class={cls("dialog", "description")}>{props.description}</p></Show>
      {props.children}
      <button {...p(revision, controller.getCloseProps)} class={cls("dialog", "close")}>{props.closeLabel ?? "Close"}</button>
    </div>
  </>;
  return <div {...p(revision, controller.getRootProps)} class={cls("dialog", "root")}>
    <button {...p(revision, controller.getTriggerProps)} class={cls("dialog", "trigger")}>{props.trigger ?? "Open"}</button>
    <Show when={controller.getState().open}>{props.portal === false ? panel() : <Portal>{panel()}</Portal>}</Show>
  </div>;
}

export function Popover(props = {}) {
  const controller = createPopoverController({ id: idFor("popover", props.id), defaultOpen: props.open ?? props.defaultOpen ?? false, onOpenChange: props.onOpenChange });
  const revision = bind(controller);
  createEffect(() => { if (props.open !== undefined) controller.syncOpen(props.open); });
  return <div {...p(revision, controller.getRootProps)} class={cls("popover", "root")}>
    <button {...p(revision, controller.getTriggerProps)} class={cls("popover", "trigger")}>{props.trigger ?? "Open"}</button>
    <Show when={controller.getState().open}><div {...p(revision, controller.getContentProps)} class={cls("popover", "content")}>{props.children}<button {...p(revision, controller.getCloseProps)} class={cls("popover", "close")}>{props.closeLabel ?? "Close"}</button></div></Show>
  </div>;
}

export function Menu(props = {}) {
  const controller = createMenuController({ id: idFor("menu", props.id), onOpenChange: props.onOpenChange }); const revision = bind(controller);
  createEffect(() => controller.setItems(props.items ?? []));
  return <div {...p(revision, controller.getRootProps)} class={cls("menu", "root")}>
    <button {...p(revision, controller.getTriggerProps)} class={cls("menu", "trigger")}>{props.trigger ?? "Menu"}</button>
    <div {...p(revision, controller.getContentProps)} class={cls("menu", "content")}>{(props.items ?? []).map((item, index) => {
      const dom = () => controller.getItemProps(index); const base = p(revision, dom); const click = base.onClick;
      return <div {...base} class={cls("menu", "item")} onClick={event => { click?.(event); if (!item.disabled) props.onSelect?.(item.value); }}>{item.label ?? item.value}</div>;
    })}</div>
  </div>;
}

export function Select(props = {}) {
  const controller = createSelectController({ id: idFor("select", props.id), defaultValue: props.value ?? props.defaultValue ?? "", onValueChange: props.onValueChange, onOpenChange: props.onOpenChange }); const revision = bind(controller);
  createEffect(() => { controller.setItems(props.items ?? []); if (props.value !== undefined) controller.syncValue(props.value); });
  const label = () => (props.items ?? []).find(item => item.value === controller.getState().value)?.label ?? props.placeholder ?? "Select…";
  return <div {...p(revision, controller.getRootProps)} class={cls("select", "root")}>
    <button {...p(revision, controller.getTriggerProps)} class={cls("select", "trigger")} disabled={props.disabled} aria-required={props.required || undefined}>{label()}</button>
    <div {...p(revision, controller.getContentProps)} class={cls("select", "content")}>{(props.items ?? []).map((item, index) => <div {...p(revision, () => controller.getItemProps(index))} class={cls("select", "item")}>{item.label ?? item.value}</div>)}</div>
    <input {...p(revision, () => controller.getHiddenInputProps(props.name, props.required, props.disabled))} class={cls("select", "hiddenInput")} />
  </div>;
}

export function Tabs(props = {}) {
  const controller = createTabsController({ id: idFor("tabs", props.id), defaultValue: props.value ?? props.defaultValue ?? "", orientation: props.orientation ?? "horizontal", onValueChange: props.onValueChange }); const revision = bind(controller);
  createEffect(() => { if (props.value !== undefined) controller.syncValue(props.value); });
  return <div {...p(revision, controller.getRootProps)} class={cls("tabs", "root")}>
    <div {...p(revision, controller.getListProps)} class={cls("tabs", "list")}>{(props.items ?? []).map(item => <button {...p(revision, () => controller.getTriggerProps(item.value, item.disabled))} class={cls("tabs", "trigger")}>{item.label ?? item.value}</button>)}</div>
    {(props.items ?? []).map(item => <div {...p(revision, () => controller.getContentProps(item.value))} class={cls("tabs", "content")}>{item.content}</div>)}
  </div>;
}

export function Tooltip(props = {}) {
  const controller = createTooltipController({ id: idFor("tooltip", props.id), delay: props.delay ?? 0, onOpenChange: props.onOpenChange }); const revision = bind(controller);
  return <span {...p(revision, controller.getRootProps)} class={cls("tooltip", "root")}><span {...p(revision, controller.getTriggerProps)} class={cls("tooltip", "trigger")} tabindex="0">{props.children}</span><span {...p(revision, controller.getContentProps)} class={cls("tooltip", "content")}>{props.content}</span></span>;
}

export function Combobox(props = {}) {
  const controller = createComboboxController({ id: idFor("combobox", props.id), defaultValue: props.value ?? props.defaultValue ?? "", defaultInputValue: props.inputValue ?? "", onValueChange: props.onValueChange, onInputValueChange: props.onInputValueChange, onOpenChange: props.onOpenChange }); const revision = bind(controller);
  createEffect(() => { controller.setItems(props.items ?? []); if (props.value !== undefined) controller.syncValue(props.value); if (props.inputValue !== undefined) controller.syncInputValue(props.inputValue); });
  return <div {...p(revision, controller.getRootProps)} class={cls("combobox", "root")}>
    <input {...p(revision, controller.getInputProps)} class={cls("combobox", "input")} placeholder={props.placeholder} disabled={props.disabled} required={props.required} aria-required={props.required || undefined} onInput={event => controller.setInputValue(event.currentTarget.value)} />
    <div {...p(revision, controller.getContentProps)} class={cls("combobox", "content")}>{(props.items ?? []).map((item, index) => <div {...p(revision, () => controller.getItemProps(index))} class={cls("combobox", "item")}>{item.label ?? item.value}</div>)}</div>
    <input {...p(revision, () => controller.getHiddenInputProps(props.name, props.required, props.disabled))} class={cls("combobox", "hiddenInput")} />
  </div>;
}

function choice(name, createController, props) {
  const component = name.toLowerCase(); const controller = createController({ id: idFor(component, props.id), defaultChecked: props.checked ?? props.defaultChecked ?? false, disabled: props.disabled, onCheckedChange: props.onCheckedChange }); const revision = bind(controller);
  createEffect(() => { if (props.checked !== undefined) controller.syncChecked(props.checked); });
  return <label {...p(revision, controller.getRootProps)} class={cls(component, "root")}><span {...p(revision, controller.getControlProps)} class={cls(component, "control")} /><input {...p(revision, () => controller.getHiddenInputProps(props.name, props.value ?? "on", props.required))} class={cls(component, "hiddenInput")} />{props.label ?? props.children}</label>;
}
export function Checkbox(props = {}) { return choice("Checkbox", createCheckboxController, props); }
export function Switch(props = {}) { return choice("Switch", createSwitchController, props); }
