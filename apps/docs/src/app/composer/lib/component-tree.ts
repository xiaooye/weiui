export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, string | boolean>;
  children: string;
}

export interface PaletteItem {
  type: string;
  label: string;
  category: PaletteCategory;
  defaultProps: Record<string, string | boolean>;
  defaultChildren: string;
}

export type PaletteCategory =
  | "Actions"
  | "Form"
  | "Display"
  | "Feedback"
  | "Navigation"
  | "Overlay"
  | "Layout"
  | "Typography"
  | "Data"
  | "Media";

// 65 components across 10 categories — mirrors packages/react/src/components/*.
export const PALETTE_ITEMS: PaletteItem[] = [
  // Actions
  { type: "Button", label: "Button", category: "Actions", defaultProps: { variant: "solid" }, defaultChildren: "Button" },
  { type: "ButtonGroup", label: "Button Group", category: "Actions", defaultProps: {}, defaultChildren: "Grouped actions" },
  { type: "ToggleGroup", label: "Toggle Group", category: "Actions", defaultProps: { type: "single" }, defaultChildren: "Toggle options" },
  { type: "SpeedDial", label: "Speed Dial", category: "Actions", defaultProps: {}, defaultChildren: "FAB menu" },

  // Form
  { type: "Input", label: "Input", category: "Form", defaultProps: { placeholder: "Enter text..." }, defaultChildren: "" },
  { type: "InputNumber", label: "Input Number", category: "Form", defaultProps: {}, defaultChildren: "" },
  { type: "InputOTP", label: "Input OTP", category: "Form", defaultProps: { length: "6" }, defaultChildren: "" },
  { type: "Textarea", label: "Textarea", category: "Form", defaultProps: { placeholder: "Message" }, defaultChildren: "" },
  { type: "Checkbox", label: "Checkbox", category: "Form", defaultProps: {}, defaultChildren: "Label" },
  { type: "Switch", label: "Switch", category: "Form", defaultProps: {}, defaultChildren: "" },
  { type: "RadioGroup", label: "Radio Group", category: "Form", defaultProps: {}, defaultChildren: "Options" },
  { type: "Slider", label: "Slider", category: "Form", defaultProps: { defaultValue: "50" }, defaultChildren: "" },
  { type: "Rating", label: "Rating", category: "Form", defaultProps: { max: "5" }, defaultChildren: "" },
  { type: "ColorPicker", label: "Color Picker", category: "Form", defaultProps: {}, defaultChildren: "" },
  { type: "AutoComplete", label: "AutoComplete", category: "Form", defaultProps: { placeholder: "Search..." }, defaultChildren: "" },
  { type: "MultiSelect", label: "Multi-Select", category: "Form", defaultProps: {}, defaultChildren: "" },
  { type: "Field", label: "Field", category: "Form", defaultProps: {}, defaultChildren: "Field wrapper" },
  { type: "Label", label: "Label", category: "Form", defaultProps: {}, defaultChildren: "Label" },
  { type: "FileUpload", label: "File Upload", category: "Form", defaultProps: {}, defaultChildren: "Drop files here" },
  { type: "DatePicker", label: "Date Picker", category: "Form", defaultProps: {}, defaultChildren: "" },
  { type: "Calendar", label: "Calendar", category: "Form", defaultProps: {}, defaultChildren: "" },

  // Display
  { type: "Badge", label: "Badge", category: "Display", defaultProps: { variant: "solid" }, defaultChildren: "Badge" },
  { type: "Card", label: "Card", category: "Display", defaultProps: {}, defaultChildren: "Card content" },
  { type: "Avatar", label: "Avatar", category: "Display", defaultProps: {}, defaultChildren: "WU" },
  { type: "Chip", label: "Chip", category: "Display", defaultProps: {}, defaultChildren: "Chip" },
  { type: "Skeleton", label: "Skeleton", category: "Display", defaultProps: {}, defaultChildren: "" },
  { type: "Code", label: "Code", category: "Display", defaultProps: {}, defaultChildren: "npm install" },
  { type: "Kbd", label: "Kbd", category: "Display", defaultProps: {}, defaultChildren: "Cmd+K" },
  { type: "Chart", label: "Chart", category: "Display", defaultProps: {}, defaultChildren: "" },

  // Feedback
  { type: "Alert", label: "Alert", category: "Feedback", defaultProps: { variant: "info" }, defaultChildren: "Alert message" },
  { type: "Spinner", label: "Spinner", category: "Feedback", defaultProps: {}, defaultChildren: "" },
  { type: "ProgressBar", label: "Progress Bar", category: "Feedback", defaultProps: { value: "40" }, defaultChildren: "" },
  { type: "EmptyState", label: "Empty State", category: "Feedback", defaultProps: {}, defaultChildren: "Nothing here yet" },
  { type: "Toast", label: "Toast", category: "Feedback", defaultProps: {}, defaultChildren: "Saved" },

  // Navigation
  { type: "Tabs", label: "Tabs", category: "Navigation", defaultProps: {}, defaultChildren: "Tabs" },
  { type: "Breadcrumb", label: "Breadcrumb", category: "Navigation", defaultProps: {}, defaultChildren: "Home / Docs" },
  { type: "Pagination", label: "Pagination", category: "Navigation", defaultProps: {}, defaultChildren: "" },
  { type: "Link", label: "Link", category: "Navigation", defaultProps: { href: "#" }, defaultChildren: "Link" },
  { type: "Menu", label: "Menu", category: "Navigation", defaultProps: {}, defaultChildren: "Menu" },
  { type: "Stepper", label: "Stepper", category: "Navigation", defaultProps: {}, defaultChildren: "Steps" },
  { type: "Sidebar", label: "Sidebar", category: "Navigation", defaultProps: {}, defaultChildren: "Sidebar" },
  { type: "AppBar", label: "App Bar", category: "Navigation", defaultProps: {}, defaultChildren: "App bar" },
  { type: "BottomNav", label: "Bottom Nav", category: "Navigation", defaultProps: {}, defaultChildren: "Bottom nav" },

  // Overlay
  { type: "Dialog", label: "Dialog", category: "Overlay", defaultProps: {}, defaultChildren: "Dialog body" },
  { type: "Drawer", label: "Drawer", category: "Overlay", defaultProps: { side: "right" }, defaultChildren: "Drawer body" },
  { type: "Popover", label: "Popover", category: "Overlay", defaultProps: {}, defaultChildren: "Popover content" },
  { type: "Tooltip", label: "Tooltip", category: "Overlay", defaultProps: {}, defaultChildren: "Tooltip" },
  { type: "CommandPalette", label: "Command Palette", category: "Overlay", defaultProps: {}, defaultChildren: "Command palette" },
  { type: "Portal", label: "Portal", category: "Overlay", defaultProps: {}, defaultChildren: "Portal content" },

  // Layout
  { type: "Container", label: "Container", category: "Layout", defaultProps: {}, defaultChildren: "Container" },
  { type: "Grid", label: "Grid", category: "Layout", defaultProps: { columns: "3" }, defaultChildren: "Grid items" },
  { type: "Stack", label: "Stack", category: "Layout", defaultProps: {}, defaultChildren: "Stack items" },
  { type: "Divider", label: "Divider", category: "Layout", defaultProps: {}, defaultChildren: "" },
  { type: "Spacer", label: "Spacer", category: "Layout", defaultProps: {}, defaultChildren: "" },
  { type: "AspectRatio", label: "Aspect Ratio", category: "Layout", defaultProps: { ratio: "16 / 9" }, defaultChildren: "" },
  { type: "Splitter", label: "Splitter", category: "Layout", defaultProps: {}, defaultChildren: "Split panes" },
  { type: "Accordion", label: "Accordion", category: "Layout", defaultProps: {}, defaultChildren: "Accordion" },

  // Typography
  { type: "Heading", label: "Heading", category: "Typography", defaultProps: { level: "2" }, defaultChildren: "Heading" },
  { type: "Text", label: "Text", category: "Typography", defaultProps: {}, defaultChildren: "Paragraph text goes here." },
  { type: "VisuallyHidden", label: "Visually Hidden", category: "Typography", defaultProps: {}, defaultChildren: "Screen-reader only" },

  // Data
  { type: "DataTable", label: "Data Table", category: "Data", defaultProps: {}, defaultChildren: "Data table" },
  { type: "TreeView", label: "Tree View", category: "Data", defaultProps: {}, defaultChildren: "Tree" },
  { type: "Transfer", label: "Transfer", category: "Data", defaultProps: {}, defaultChildren: "Transfer" },
  { type: "Timeline", label: "Timeline", category: "Data", defaultProps: {}, defaultChildren: "Timeline" },

  // Media
  { type: "Editor", label: "Rich Editor", category: "Media", defaultProps: {}, defaultChildren: "Rich text" },
];

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

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  "Actions",
  "Form",
  "Display",
  "Feedback",
  "Navigation",
  "Overlay",
  "Layout",
  "Typography",
  "Data",
  "Media",
];
