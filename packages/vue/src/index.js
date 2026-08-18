import { Teleport, defineComponent, h, onBeforeUnmount, ref, watch } from "vue";
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
  semanticPart,
} from "@weiui/core";

const eventNames = {
  click: "onClick", keydown: "onKeydown", pointermove: "onPointermove",
  pointerenter: "onPointerenter", pointerleave: "onPointerleave", focus: "onFocus", blur: "onBlur",
};

export function normalizeVueProps(dom = {}) {
  const out = { ...(dom.attributes ?? {}) };
  if (dom.style) out.style = dom.style;
  for (const [name, handler] of Object.entries(dom.listeners ?? {})) {
    out[eventNames[name] ?? `on${name[0].toUpperCase()}${name.slice(1)}`] = handler;
  }
  return out;
}
function bind(controller) {
  const revision = ref(0);
  const stop = controller.subscribe(() => { revision.value += 1; });
  onBeforeUnmount(stop);
  return revision;
}
function cls(component, part) {
  return part === "root" ? `wui-${component}` : `wui-${component}__${part}`;
}
function coreNode(tag, component, part, props, children, extra = {}) {
  return h(tag, { ...normalizeVueProps(props), ...extra, class: [cls(component, part), extra.class] }, children);
}
function visual(name, tag = "div") {
  const component = name.toLowerCase();
  return defineComponent({
    name: `Wui${name}`, inheritAttrs: false,
    props: { variant: String, size: String },
    setup(props, { attrs, slots }) {
      return () => h(tag, {
        ...attrs, ...semanticPart(component, "root", { variant: props.variant, size: props.size }),
        class: [cls(component, "root"), props.variant && `wui-${component}--${props.variant}`, props.size && `wui-${component}--${props.size}`, attrs.class],
      }, slots.default?.());
    },
  });
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

const itemProps = { items: { type: Array, default: () => [] }, id: String };

export const Accordion = defineComponent({
  name: "WuiAccordion",
  props: { ...itemProps, type: { type: String, default: "single" }, modelValue: Array, defaultValue: { type: Array, default: () => [] } },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const controller = createAccordionController({ id: props.id ?? "wui-accordion", type: props.type, defaultValue: props.modelValue ?? props.defaultValue, onValueChange: value => emit("update:modelValue", [...value]) });
    const revision = bind(controller);
    watch(() => props.modelValue, value => { if (value) controller.store.setState({ expanded: new Set(value) }); });
    return () => {
      revision.value;
      return coreNode("div", "accordion", "root", controller.getRootProps(), props.items.map(item =>
        coreNode("div", "accordion", "item", controller.getItemProps(item.value, item.disabled), [
          coreNode("button", "accordion", "trigger", controller.getTriggerProps(item.value, item.disabled), item.label ?? item.value),
          coreNode("div", "accordion", "content", controller.getContentProps(item.value), item.content),
        ])
      ));
    };
  },
});

function disclosure(name, createController, renderContent) {
  const component = name.toLowerCase();
  return defineComponent({
    name: `Wui${name}`,
    props: { id: String, modelValue: Boolean, defaultOpen: Boolean, trigger: { type: String, default: "Open" }, title: String, description: String, teleport: { type: Boolean, default: true } },
    emits: ["update:modelValue"],
    setup(props, { slots, emit }) {
      const controller = createController({ id: props.id ?? `wui-${component}`, defaultOpen: props.modelValue ?? props.defaultOpen, onOpenChange: value => emit("update:modelValue", value) });
      const revision = bind(controller);
      watch(() => props.modelValue, value => { if (value !== undefined) controller.store.setState({ open: value }); });
      return () => {
        revision.value;
        const trigger = coreNode("button", component, "trigger", controller.getTriggerProps(), props.trigger);
        const content = renderContent(controller, props, slots);
        return coreNode("div", component, "root", controller.getRootProps(), [trigger, content]);
      };
    },
  });
}
export const Dialog = disclosure("Dialog", createDialogController, (controller, props, slots) => {
  if (!controller.getState().open) return null;
  const panel = coreNode("div", "dialog", "content", controller.getContentProps(), [
    props.title && coreNode("h2", "dialog", "title", controller.getTitleProps(), props.title),
    props.description && coreNode("p", "dialog", "description", controller.getDescriptionProps(), props.description),
    slots.default?.(),
    coreNode("button", "dialog", "close", controller.getCloseProps(), "Close"),
  ]);
  const body = [coreNode("div", "dialog", "overlay", controller.getOverlayProps()), panel];
  return props.teleport ? h(Teleport, { to: "body" }, body) : body;
});
export const Popover = disclosure("Popover", createPopoverController, (controller, _props, slots) =>
  controller.getState().open ? coreNode("div", "popover", "content", controller.getContentProps(), [slots.default?.(), coreNode("button", "popover", "close", controller.getCloseProps(), "Close")]) : null
);

export const Menu = defineComponent({
  name: "WuiMenu", props: { ...itemProps, trigger: { type: String, default: "Menu" } }, emits: ["select"],
  setup(props, { emit }) {
    const controller = createMenuController({ id: props.id ?? "wui-menu" }); const revision = bind(controller);
    controller.setItems(props.items);
    watch(() => props.items, value => controller.setItems(value));
    return () => {
      revision.value;
      return coreNode("div", "menu", "root", controller.getRootProps(), [
        coreNode("button", "menu", "trigger", controller.getTriggerProps(), props.trigger),
        coreNode("div", "menu", "content", controller.getContentProps(), props.items.map((item, index) => {
          const core = normalizeVueProps(controller.getItemProps(index));
          const click = core.onClick;
          return h("div", { ...core, class: cls("menu", "item"), onClick: event => { click?.(event); if (!item.disabled) emit("select", item.value); } }, item.label ?? item.value);
        })),
      ]);
    };
  },
});

function collection(name, createController) {
  const component = name.toLowerCase();
  return defineComponent({
    name: `Wui${name}`, props: { ...itemProps, modelValue: String, defaultValue: { type: String, default: "" }, placeholder: { type: String, default: "Select…" } }, emits: ["update:modelValue"],
    setup(props, { emit }) {
      const controller = createController({ id: props.id ?? `wui-${component}`, defaultValue: props.modelValue ?? props.defaultValue, onValueChange: value => emit("update:modelValue", value) });
      const revision = bind(controller); controller.setItems(props.items);
      watch(() => props.items, value => controller.setItems(value));
      watch(() => props.modelValue, value => { if (value !== undefined) controller.store.setState({ ...controller.getState(), value }); });
      return { controller, revision };
    },
  });
}
export const Select = defineComponent({
  ...collection("Select", createSelectController),
  setup(props, ctx) {
    const base = collection("Select", createSelectController).setup(props, ctx);
    const { controller, revision } = base;
    return () => {
      revision.value;
      const selected = props.items.find(item => item.value === controller.getState().value);
      return coreNode("div", "select", "root", controller.getRootProps(), [
        coreNode("button", "select", "trigger", controller.getTriggerProps(), selected?.label ?? props.placeholder),
        coreNode("div", "select", "content", controller.getContentProps(), props.items.map((item, index) =>
          coreNode("div", "select", "item", controller.getItemProps(index), item.label ?? item.value)
        )),
      ]);
    };
  },
});

export const Tabs = defineComponent({
  name: "WuiTabs", props: { ...itemProps, modelValue: String, defaultValue: { type: String, default: "" }, orientation: { type: String, default: "horizontal" } }, emits: ["update:modelValue"],
  setup(props, { emit }) {
    const controller = createTabsController({ id: props.id ?? "wui-tabs", defaultValue: props.modelValue ?? props.defaultValue, orientation: props.orientation, onValueChange: value => emit("update:modelValue", value) });
    const revision = bind(controller);
    watch(() => props.modelValue, value => { if (value !== undefined) controller.store.setState({ value }); });
    return () => {
      revision.value;
      return coreNode("div", "tabs", "root", controller.getRootProps(), [
        coreNode("div", "tabs", "list", controller.getListProps(), props.items.map(item =>
          coreNode("button", "tabs", "trigger", controller.getTriggerProps(item.value, item.disabled), item.label ?? item.value)
        )),
        ...props.items.map(item => coreNode("div", "tabs", "content", controller.getContentProps(item.value), item.content)),
      ]);
    };
  },
});

export const Tooltip = defineComponent({
  name: "WuiTooltip", props: { id: String, content: { type: String, required: true }, delay: { type: Number, default: 0 } },
  setup(props, { slots }) {
    const controller = createTooltipController({ id: props.id ?? "wui-tooltip", delay: props.delay }); const revision = bind(controller);
    return () => {
      revision.value;
      return coreNode("span", "tooltip", "root", controller.getRootProps(), [
        coreNode("span", "tooltip", "trigger", controller.getTriggerProps(), slots.default?.(), { tabindex: 0 }),
        coreNode("span", "tooltip", "content", controller.getContentProps(), props.content),
      ]);
    };
  },
});

export const Combobox = defineComponent({
  name: "WuiCombobox", props: { ...itemProps, modelValue: String, defaultValue: { type: String, default: "" }, inputValue: String, placeholder: String }, emits: ["update:modelValue", "update:inputValue"],
  setup(props, { emit }) {
    const controller = createComboboxController({ id: props.id ?? "wui-combobox", defaultValue: props.modelValue ?? props.defaultValue, defaultInputValue: props.inputValue ?? "", onValueChange: value => emit("update:modelValue", value), onInputValueChange: value => emit("update:inputValue", value) });
    const revision = bind(controller); controller.setItems(props.items);
    watch(() => props.items, value => controller.setItems(value));
    watch(() => props.modelValue, value => { if (value !== undefined) controller.store.setState({ ...controller.getState(), value }); });
    watch(() => props.inputValue, value => { if (value !== undefined && value !== controller.getState().inputValue) controller.store.setState({ ...controller.getState(), inputValue: value }); });
    return () => {
      revision.value;
      const input = normalizeVueProps(controller.getInputProps());
      return coreNode("div", "combobox", "root", controller.getRootProps(), [
        h("input", { ...input, class: cls("combobox", "input"), placeholder: props.placeholder, onInput: event => controller.setInputValue(event.currentTarget.value) }),
        coreNode("div", "combobox", "content", controller.getContentProps(), props.items.map((item, index) => coreNode("div", "combobox", "item", controller.getItemProps(index), item.label ?? item.value))),
      ]);
    };
  },
});

function choice(name, createController) {
  const component = name.toLowerCase();
  return defineComponent({
    name: `Wui${name}`, props: { id: String, modelValue: Boolean, defaultChecked: Boolean, disabled: Boolean, label: String, name: String, value: { type: String, default: "on" } }, emits: ["update:modelValue"],
    setup(props, { emit }) {
      const controller = createController({ id: props.id ?? `wui-${component}`, defaultChecked: props.modelValue ?? props.defaultChecked, disabled: props.disabled, onCheckedChange: value => emit("update:modelValue", value) });
      const revision = bind(controller);
      watch(() => props.modelValue, value => { if (value !== undefined) controller.store.setState({ checked: value }); });
      return () => {
        revision.value;
        return coreNode("label", component, "root", controller.getRootProps(), [
          coreNode("span", component, "control", controller.getControlProps()),
          coreNode("input", component, "hiddenInput", controller.getHiddenInputProps(props.name, props.value)),
          props.label,
        ]);
      };
    },
  });
}
export const Checkbox = choice("Checkbox", createCheckboxController);
export const Switch = choice("Switch", createSwitchController);
