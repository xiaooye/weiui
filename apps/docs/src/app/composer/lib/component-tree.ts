export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, string | boolean>;
  children: string;
}

export const PALETTE_ITEMS = [
  { type: "Button", defaultProps: { variant: "solid" }, defaultChildren: "Button" },
  { type: "Input", defaultProps: { placeholder: "Enter text..." }, defaultChildren: "" },
  { type: "Badge", defaultProps: { variant: "solid" }, defaultChildren: "Badge" },
  { type: "Card", defaultProps: {}, defaultChildren: "Card content" },
  { type: "Avatar", defaultProps: {}, defaultChildren: "WU" },
  { type: "Alert", defaultProps: { variant: "info" }, defaultChildren: "Alert message" },
  { type: "Divider", defaultProps: {}, defaultChildren: "" },
  { type: "Heading", defaultProps: { level: "2" }, defaultChildren: "Heading" },
  { type: "Text", defaultProps: {}, defaultChildren: "Paragraph text goes here." },
] as const;

let counter = 0;
export function createNode(type: string): ComponentNode {
  const item = PALETTE_ITEMS.find((i) => i.type === type);
  return {
    id: `node-${++counter}`,
    type,
    props: { ...(item?.defaultProps ?? {}) },
    children: item?.defaultChildren ?? "",
  };
}
