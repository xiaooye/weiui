export interface ComponentAnatomy<Name extends string = string, Part extends string = string> {
  readonly name: Name;
  readonly parts: readonly Part[];
}

export function createAnatomy<const Name extends string, const Parts extends readonly string[]>(
  name: Name,
  parts: Parts,
): ComponentAnatomy<Name, Parts[number]> {
  return Object.freeze({ name, parts: Object.freeze([...parts]) });
}

export const anatomy = {
  button: createAnatomy("button", ["root"] as const),
  accordion: createAnatomy("accordion", ["root", "item", "trigger", "content"] as const),
  dialog: createAnatomy("dialog", ["root", "trigger", "positioner", "overlay", "content", "title", "description", "close"] as const),
  menu: createAnatomy("menu", ["root", "trigger", "positioner", "content", "item", "separator", "label", "itemIndicator"] as const),
  popover: createAnatomy("popover", ["root", "trigger", "positioner", "content", "arrow", "close"] as const),
  select: createAnatomy("select", ["root", "label", "trigger", "valueText", "indicator", "positioner", "content", "item", "itemText", "itemIndicator"] as const),
  tabs: createAnatomy("tabs", ["root", "list", "trigger", "content", "indicator"] as const),
  tooltip: createAnatomy("tooltip", ["root", "trigger", "positioner", "content", "arrow"] as const),
  combobox: createAnatomy("combobox", ["root", "label", "control", "input", "trigger", "clearTrigger", "positioner", "content", "item", "itemText", "itemIndicator"] as const),
  checkbox: createAnatomy("checkbox", ["root", "control", "indicator", "label", "hiddenInput"] as const),
  switch: createAnatomy("switch", ["root", "control", "thumb", "label", "hiddenInput"] as const),
} as const;
