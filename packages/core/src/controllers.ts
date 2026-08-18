import { createCollection, type CollectionItem, type CollectionStore } from "./collection";
import { semanticPart, type WeiDOMProps, type WeiUIEvent } from "./dom";
import { createIds } from "./ids";
import { createStore, type WeiStore } from "./store";

export interface Controller<State> {
  readonly store: WeiStore<State>;
  getState(): Readonly<State>;
  subscribe(listener: (state: Readonly<State>) => void): () => void;
}

function baseController<State>(store: WeiStore<State>): Controller<State> {
  return { store, getState: store.getState, subscribe: store.subscribe };
}
function prevent(event: WeiUIEvent): void { event.preventDefault?.(); }
function keyIs(event: WeiUIEvent, ...keys: readonly string[]): boolean { return event.key !== undefined && keys.includes(event.key); }

export interface DisclosureState { open: boolean; }
export interface DisclosureOptions { id: string; component: string; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; }
export interface DisclosureController extends Controller<DisclosureState> {
  open(): void; close(): void; toggle(): void; setOpen(open: boolean): void;
  getRootProps(): WeiDOMProps; getTriggerProps(): WeiDOMProps; getContentProps(): WeiDOMProps;
}
export function createDisclosureController(options: DisclosureOptions): DisclosureController {
  const ids = createIds(options.component, options.id);
  const store = createStore<DisclosureState>({ open: options.defaultOpen ?? false });
  const setOpen = (open: boolean) => { if (store.getState().open === open) return; store.setState({ open }); options.onOpenChange?.(open); };
  return {
    ...baseController(store), open: () => setOpen(true), close: () => setOpen(false), toggle: () => setOpen(!store.getState().open), setOpen,
    getRootProps: () => ({ attributes: semanticPart(options.component, "root", { state: store.getState().open ? "open" : "closed" }) }),
    getTriggerProps: () => ({ attributes: { ...semanticPart(options.component, "trigger", { state: store.getState().open ? "open" : "closed" }), id: ids.part("trigger"), "aria-expanded": store.getState().open, "aria-controls": ids.part("content") }, listeners: { click: () => setOpen(!store.getState().open) } }),
    getContentProps: () => ({ attributes: { ...semanticPart(options.component, "content", { state: store.getState().open ? "open" : "closed" }), id: ids.part("content"), hidden: !store.getState().open }, listeners: { keydown: (event) => { if (event.key === "Escape") { prevent(event); setOpen(false); } } } }),
  };
}

export interface AccordionState { expanded: ReadonlySet<string>; }
export interface AccordionOptions { id: string; type?: "single" | "multiple"; defaultValue?: readonly string[]; onValueChange?: (value: readonly string[]) => void; }
export interface AccordionController extends Controller<AccordionState> {
  toggle(value: string): void; isExpanded(value: string): boolean;
  getRootProps(): WeiDOMProps; getItemProps(value: string, disabled?: boolean): WeiDOMProps; getTriggerProps(value: string, disabled?: boolean): WeiDOMProps; getContentProps(value: string): WeiDOMProps;
}
export function createAccordionController(options: AccordionOptions): AccordionController {
  const ids = createIds("accordion", options.id); const type = options.type ?? "single";
  const store = createStore<AccordionState>({ expanded: new Set(options.defaultValue ?? []) });
  const isExpanded = (value: string) => store.getState().expanded.has(value);
  const toggle = (value: string) => { const next = new Set(store.getState().expanded); if (next.has(value)) next.delete(value); else { if (type === "single") next.clear(); next.add(value); } store.setState({ expanded: next }); options.onValueChange?.([...next]); };
  return {
    ...baseController(store), toggle, isExpanded,
    getRootProps: () => ({ attributes: { ...semanticPart("accordion", "root"), id: ids.root } }),
    getItemProps: (value, disabled = false) => ({ attributes: semanticPart("accordion", "item", { state: isExpanded(value) ? "open" : "closed", disabled }) }),
    getTriggerProps: (value, disabled = false) => ({ attributes: { ...semanticPart("accordion", "trigger", { state: isExpanded(value) ? "open" : "closed", disabled }), id: ids.part("trigger", value), type: "button", disabled, "aria-expanded": isExpanded(value), "aria-controls": ids.part("content", value) }, listeners: { click: () => { if (!disabled) toggle(value); } } }),
    getContentProps: (value) => ({ attributes: { ...semanticPart("accordion", "content", { state: isExpanded(value) ? "open" : "closed" }), id: ids.part("content", value), role: "region", "aria-labelledby": ids.part("trigger", value), hidden: !isExpanded(value) } }),
  };
}

export interface DialogState extends DisclosureState {}
export interface DialogOptions extends Omit<DisclosureOptions, "component"> {}
export interface DialogController extends DisclosureController { getOverlayProps(): WeiDOMProps; getTitleProps(): WeiDOMProps; getDescriptionProps(): WeiDOMProps; getCloseProps(): WeiDOMProps; }
export function createDialogController(options: DialogOptions): DialogController {
  const base = createDisclosureController({ ...options, component: "dialog" }); const ids = createIds("dialog", options.id);
  return {
    ...base,
    getTriggerProps: () => { const props = base.getTriggerProps(); return { ...props, attributes: { ...props.attributes, "aria-haspopup": "dialog" } }; },
    getContentProps: () => { const props = base.getContentProps(); return { ...props, attributes: { ...props.attributes, role: "dialog", "aria-modal": true, "aria-labelledby": ids.part("title"), "aria-describedby": ids.part("description") } }; },
    getOverlayProps: () => ({ attributes: semanticPart("dialog", "overlay", { state: base.getState().open ? "open" : "closed" }), listeners: { click: () => base.close() } }),
    getTitleProps: () => ({ attributes: { ...semanticPart("dialog", "title"), id: ids.part("title") } }),
    getDescriptionProps: () => ({ attributes: { ...semanticPart("dialog", "description"), id: ids.part("description") } }),
    getCloseProps: () => ({ attributes: { ...semanticPart("dialog", "close"), type: "button", "aria-label": "Close" }, listeners: { click: () => base.close() } }),
  };
}

export interface TabsState { value: string; }
export interface TabsOptions { id: string; defaultValue?: string; orientation?: "horizontal" | "vertical"; onValueChange?: (value: string) => void; }
export interface TabsController extends Controller<TabsState> { select(value: string): void; getRootProps(): WeiDOMProps; getListProps(): WeiDOMProps; getTriggerProps(value: string, disabled?: boolean): WeiDOMProps; getContentProps(value: string): WeiDOMProps; }
export function createTabsController(options: TabsOptions): TabsController {
  const ids = createIds("tabs", options.id); const orientation = options.orientation ?? "horizontal"; const store = createStore<TabsState>({ value: options.defaultValue ?? "" });
  const select = (value: string) => { if (value === store.getState().value) return; store.setState({ value }); options.onValueChange?.(value); };
  return {
    ...baseController(store), select,
    getRootProps: () => ({ attributes: { ...semanticPart("tabs", "root", { orientation }), id: ids.root } }),
    getListProps: () => ({ attributes: { ...semanticPart("tabs", "list", { orientation }), role: "tablist", "aria-orientation": orientation } }),
    getTriggerProps: (value, disabled = false) => { const selected = store.getState().value === value; return { attributes: { ...semanticPart("tabs", "trigger", { selected, disabled, state: selected ? "active" : "inactive", orientation }), id: ids.part("trigger", value), role: "tab", type: "button", disabled, tabindex: selected ? 0 : -1, "aria-selected": selected, "aria-controls": ids.part("content", value) }, listeners: { click: () => { if (!disabled) select(value); } } }; },
    getContentProps: (value) => { const selected = store.getState().value === value; return { attributes: { ...semanticPart("tabs", "content", { selected, state: selected ? "active" : "inactive" }), id: ids.part("content", value), role: "tabpanel", tabindex: 0, "aria-labelledby": ids.part("trigger", value), hidden: !selected } }; },
  };
}

export interface ChoiceState { checked: boolean; }
export interface ChoiceOptions { id: string; component: "checkbox" | "switch"; defaultChecked?: boolean; disabled?: boolean; onCheckedChange?: (checked: boolean) => void; }
export interface ChoiceController extends Controller<ChoiceState> { toggle(): void; setChecked(checked: boolean): void; getRootProps(): WeiDOMProps; getControlProps(): WeiDOMProps; getHiddenInputProps(name?: string, value?: string): WeiDOMProps; }
export function createChoiceController(options: ChoiceOptions): ChoiceController {
  const ids = createIds(options.component, options.id); const store = createStore<ChoiceState>({ checked: options.defaultChecked ?? false });
  const setChecked = (checked: boolean) => { if (options.disabled || checked === store.getState().checked) return; store.setState({ checked }); options.onCheckedChange?.(checked); }; const state = () => store.getState().checked ? "checked" : "unchecked";
  return {
    ...baseController(store), toggle: () => setChecked(!store.getState().checked), setChecked,
    getRootProps: () => ({ attributes: { ...semanticPart(options.component, "root", { state: state(), disabled: options.disabled }), id: ids.root } }),
    getControlProps: () => ({ attributes: { ...semanticPart(options.component, "control", { state: state(), disabled: options.disabled }), role: options.component, tabindex: options.disabled ? -1 : 0, "aria-checked": store.getState().checked, "aria-disabled": options.disabled || undefined }, listeners: { click: () => setChecked(!store.getState().checked), keydown: (event) => { if (keyIs(event, " ", "Enter")) { prevent(event); setChecked(!store.getState().checked); } } } }),
    getHiddenInputProps: (name, value = "on") => ({ attributes: { ...semanticPart(options.component, "hiddenInput"), type: "checkbox", name, value, checked: store.getState().checked, disabled: options.disabled, tabindex: -1, "aria-hidden": true } }),
  };
}
export function createCheckboxController(options: Omit<ChoiceOptions, "component">): ChoiceController { return createChoiceController({ ...options, component: "checkbox" }); }
export function createSwitchController(options: Omit<ChoiceOptions, "component">): ChoiceController { return createChoiceController({ ...options, component: "switch" }); }

export interface MenuState extends DisclosureState { highlightedIndex: number; }
export interface MenuOptions { id: string; loop?: boolean; onOpenChange?: (open: boolean) => void; }
export interface MenuController extends Controller<MenuState> { readonly collection: CollectionStore; setItems(items: readonly CollectionItem[]): void; open(): void; close(): void; highlight(index: number): void; move(direction: 1 | -1): void; getRootProps(): WeiDOMProps; getTriggerProps(): WeiDOMProps; getContentProps(): WeiDOMProps; getItemProps(index: number): WeiDOMProps; }
export function createMenuController(options: MenuOptions): MenuController {
  const ids = createIds("menu", options.id); const collection = createCollection(); const store = createStore<MenuState>({ open: false, highlightedIndex: -1 });
  const setOpen = (open: boolean) => { store.setState({ open, highlightedIndex: open ? store.getState().highlightedIndex : -1 }); options.onOpenChange?.(open); };
  const move = (direction: 1 | -1) => { const index = collection.nextEnabled(store.getState().highlightedIndex, direction); store.setState({ ...store.getState(), highlightedIndex: index }); };
  const keydown = (event: WeiUIEvent) => { if (keyIs(event, "ArrowDown")) { prevent(event); move(1); } else if (keyIs(event, "ArrowUp")) { prevent(event); move(-1); } else if (keyIs(event, "Home")) { prevent(event); store.setState({ ...store.getState(), highlightedIndex: collection.nextEnabled(-1, 1) }); } else if (keyIs(event, "End")) { prevent(event); store.setState({ ...store.getState(), highlightedIndex: collection.nextEnabled(0, -1) }); } else if (keyIs(event, "Escape")) { prevent(event); setOpen(false); } };
  return {
    ...baseController(store), collection, setItems: (items) => collection.setItems(items), open: () => setOpen(true), close: () => setOpen(false), highlight: (highlightedIndex) => store.setState({ ...store.getState(), highlightedIndex }), move,
    getRootProps: () => ({ attributes: semanticPart("menu", "root", { state: store.getState().open ? "open" : "closed" }) }),
    getTriggerProps: () => ({ attributes: { ...semanticPart("menu", "trigger", { state: store.getState().open ? "open" : "closed" }), id: ids.part("trigger"), type: "button", "aria-haspopup": "menu", "aria-expanded": store.getState().open, "aria-controls": ids.part("content") }, listeners: { click: () => setOpen(!store.getState().open), keydown: (event) => { if (keyIs(event, "ArrowDown", "ArrowUp")) { prevent(event); setOpen(true); move(event.key === "ArrowDown" ? 1 : -1); } } } }),
    getContentProps: () => ({ attributes: { ...semanticPart("menu", "content", { state: store.getState().open ? "open" : "closed" }), id: ids.part("content"), role: "menu", "aria-labelledby": ids.part("trigger"), hidden: !store.getState().open, tabindex: -1 }, listeners: { keydown } }),
    getItemProps: (index) => { const item = collection.items[index]; const disabled = item?.disabled ?? false; const highlighted = store.getState().highlightedIndex === index; return { attributes: { ...semanticPart("menu", "item", { disabled, highlighted }), id: ids.part("item", index), role: "menuitem", tabindex: highlighted ? 0 : -1, "aria-disabled": disabled || undefined }, listeners: { pointermove: () => { if (!disabled) store.setState({ ...store.getState(), highlightedIndex: index }); }, click: () => { if (!disabled) setOpen(false); } } }; },
  };
}

export interface SelectState extends DisclosureState { value: string; highlightedIndex: number; }
export interface SelectOptions { id: string; defaultValue?: string; onValueChange?: (value: string) => void; onOpenChange?: (open: boolean) => void; }
export interface SelectController extends Controller<SelectState> { readonly collection: CollectionStore; setItems(items: readonly CollectionItem[]): void; open(): void; close(): void; select(value: string): void; highlight(index: number): void; getRootProps(): WeiDOMProps; getTriggerProps(): WeiDOMProps; getContentProps(): WeiDOMProps; getItemProps(index: number): WeiDOMProps; }
export function createSelectController(options: SelectOptions): SelectController {
  const ids = createIds("select", options.id); const collection = createCollection(); const store = createStore<SelectState>({ open: false, value: options.defaultValue ?? "", highlightedIndex: -1 });
  const setOpen = (open: boolean) => { store.setState({ ...store.getState(), open, highlightedIndex: open ? store.getState().highlightedIndex : -1 }); options.onOpenChange?.(open); };
  const highlight = (highlightedIndex: number) => store.setState({ ...store.getState(), highlightedIndex }); const move = (direction: 1 | -1) => highlight(collection.nextEnabled(store.getState().highlightedIndex, direction));
  const select = (value: string) => { if (value === store.getState().value) { setOpen(false); return; } store.setState({ ...store.getState(), value, open: false, highlightedIndex: -1 }); options.onValueChange?.(value); options.onOpenChange?.(false); };
  const keydown = (event: WeiUIEvent) => { if (keyIs(event, "ArrowDown")) { prevent(event); if (!store.getState().open) setOpen(true); move(1); } else if (keyIs(event, "ArrowUp")) { prevent(event); if (!store.getState().open) setOpen(true); move(-1); } else if (keyIs(event, "Enter", " ") && store.getState().open) { prevent(event); const item = collection.items[store.getState().highlightedIndex]; if (item && !item.disabled) select(item.value); } else if (keyIs(event, "Escape")) { prevent(event); setOpen(false); } else if (event.key?.length === 1) { const found = collection.findByPrefix(event.key, store.getState().highlightedIndex); if (found >= 0) highlight(found); } };
  return {
    ...baseController(store), collection, setItems: (items) => collection.setItems(items), open: () => setOpen(true), close: () => setOpen(false), select, highlight,
    getRootProps: () => ({ attributes: semanticPart("select", "root", { state: store.getState().open ? "open" : "closed" }) }),
    getTriggerProps: () => ({ attributes: { ...semanticPart("select", "trigger", { state: store.getState().open ? "open" : "closed" }), id: ids.part("trigger"), role: "combobox", type: "button", "aria-expanded": store.getState().open, "aria-controls": ids.part("content"), "aria-haspopup": "listbox" }, listeners: { click: () => setOpen(!store.getState().open), keydown } }),
    getContentProps: () => ({ attributes: { ...semanticPart("select", "content", { state: store.getState().open ? "open" : "closed" }), id: ids.part("content"), role: "listbox", hidden: !store.getState().open, "aria-labelledby": ids.part("trigger") }, listeners: { keydown } }),
    getItemProps: (index) => { const item = collection.items[index]; const disabled = item?.disabled ?? false; const selected = item?.value === store.getState().value; const highlighted = index === store.getState().highlightedIndex; return { attributes: { ...semanticPart("select", "item", { selected, highlighted, disabled }), id: ids.part("item", index), role: "option", "aria-selected": selected, "aria-disabled": disabled || undefined }, listeners: { pointermove: () => { if (!disabled) highlight(index); }, click: () => { if (item && !disabled) select(item.value); } } }; },
  };
}

export interface ComboboxState extends SelectState { inputValue: string; }
export interface ComboboxOptions extends SelectOptions { defaultInputValue?: string; onInputValueChange?: (value: string) => void; }
export interface ComboboxController extends Controller<ComboboxState> { readonly collection: CollectionStore; setItems(items: readonly CollectionItem[]): void; open(): void; close(): void; select(value: string): void; setInputValue(value: string): void; highlight(index: number): void; getRootProps(): WeiDOMProps; getInputProps(): WeiDOMProps; getTriggerProps(): WeiDOMProps; getContentProps(): WeiDOMProps; getItemProps(index: number): WeiDOMProps; }
export function createComboboxController(options: ComboboxOptions): ComboboxController {
  const ids = createIds("combobox", options.id); const collection = createCollection(); const store = createStore<ComboboxState>({ open: false, value: options.defaultValue ?? "", inputValue: options.defaultInputValue ?? "", highlightedIndex: -1 });
  const setOpen = (open: boolean) => { store.setState({ ...store.getState(), open, highlightedIndex: open ? store.getState().highlightedIndex : -1 }); options.onOpenChange?.(open); };
  const highlight = (highlightedIndex: number) => store.setState({ ...store.getState(), highlightedIndex });
  const setInputValue = (inputValue: string) => { store.setState({ ...store.getState(), inputValue, open: true, highlightedIndex: -1 }); options.onInputValueChange?.(inputValue); options.onOpenChange?.(true); };
  const select = (value: string) => { const item = collection.items.find((entry) => entry.value === value); const inputValue = item?.label ?? store.getState().inputValue; store.setState({ ...store.getState(), value, inputValue, open: false, highlightedIndex: -1 }); options.onValueChange?.(value); options.onInputValueChange?.(inputValue); options.onOpenChange?.(false); };
  const move = (direction: 1 | -1) => highlight(collection.nextEnabled(store.getState().highlightedIndex, direction));
  const keydown = (event: WeiUIEvent) => { if (keyIs(event, "ArrowDown")) { prevent(event); setOpen(true); move(1); } else if (keyIs(event, "ArrowUp")) { prevent(event); setOpen(true); move(-1); } else if (keyIs(event, "Enter")) { const item = collection.items[store.getState().highlightedIndex]; if (item && !item.disabled) { prevent(event); select(item.value); } } else if (keyIs(event, "Escape")) { prevent(event); setOpen(false); } };
  return {
    ...baseController(store), collection, setItems: (items) => collection.setItems(items), open: () => setOpen(true), close: () => setOpen(false), select, setInputValue, highlight,
    getRootProps: () => ({ attributes: semanticPart("combobox", "root", { state: store.getState().open ? "open" : "closed" }) }),
    getInputProps: () => ({ attributes: { ...semanticPart("combobox", "input", { state: store.getState().open ? "open" : "closed" }), id: ids.part("input"), role: "combobox", autocomplete: "off", "aria-autocomplete": "list", "aria-expanded": store.getState().open, "aria-controls": ids.part("content"), "aria-activedescendant": store.getState().highlightedIndex >= 0 ? ids.part("item", store.getState().highlightedIndex) : undefined, value: store.getState().inputValue }, listeners: { keydown } }),
    getTriggerProps: () => ({ attributes: { ...semanticPart("combobox", "trigger", { state: store.getState().open ? "open" : "closed" }), type: "button", "aria-label": "Toggle options" }, listeners: { click: () => setOpen(!store.getState().open) } }),
    getContentProps: () => ({ attributes: { ...semanticPart("combobox", "content", { state: store.getState().open ? "open" : "closed" }), id: ids.part("content"), role: "listbox", hidden: !store.getState().open } }),
    getItemProps: (index) => { const item = collection.items[index]; const disabled = item?.disabled ?? false; const selected = item?.value === store.getState().value; const highlighted = index === store.getState().highlightedIndex; return { attributes: { ...semanticPart("combobox", "item", { disabled, selected, highlighted }), id: ids.part("item", index), role: "option", "aria-selected": selected, "aria-disabled": disabled || undefined }, listeners: { pointermove: () => { if (!disabled) highlight(index); }, click: () => { if (item && !disabled) select(item.value); } } }; },
  };
}

export interface TooltipState extends DisclosureState {}
export interface TooltipOptions { id: string; delay?: number; onOpenChange?: (open: boolean) => void; }
export interface TooltipController extends Controller<TooltipState> { open(): void; close(): void; getRootProps(): WeiDOMProps; getTriggerProps(): WeiDOMProps; getContentProps(): WeiDOMProps; }
export function createTooltipController(options: TooltipOptions): TooltipController {
  const ids = createIds("tooltip", options.id); const store = createStore<TooltipState>({ open: false }); let timer: ReturnType<typeof setTimeout> | undefined;
  const setOpen = (open: boolean) => { if (store.getState().open === open) return; store.setState({ open }); options.onOpenChange?.(open); };
  const open = () => { if ((options.delay ?? 0) > 0) timer = setTimeout(() => setOpen(true), options.delay); else setOpen(true); };
  const close = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; setOpen(false); };
  return { ...baseController(store), open, close, getRootProps: () => ({ attributes: semanticPart("tooltip", "root", { state: store.getState().open ? "open" : "closed" }) }), getTriggerProps: () => ({ attributes: { ...semanticPart("tooltip", "trigger", { state: store.getState().open ? "open" : "closed" }), "aria-describedby": store.getState().open ? ids.part("content") : undefined }, listeners: { pointerenter: open, pointerleave: close, focus: open, blur: close, keydown: (event) => { if (event.key === "Escape") close(); } } }), getContentProps: () => ({ attributes: { ...semanticPart("tooltip", "content", { state: store.getState().open ? "open" : "closed" }), id: ids.part("content"), role: "tooltip", hidden: !store.getState().open } }) };
}

export interface PopoverController extends DisclosureController { getCloseProps(): WeiDOMProps; }
export function createPopoverController(options: DialogOptions): PopoverController {
  const base = createDisclosureController({ ...options, component: "popover" });
  return { ...base, getTriggerProps: () => { const props = base.getTriggerProps(); return { ...props, attributes: { ...props.attributes, "aria-haspopup": "dialog" } }; }, getCloseProps: () => ({ attributes: { ...semanticPart("popover", "close"), type: "button", "aria-label": "Close" }, listeners: { click: () => base.close() } }) };
}
