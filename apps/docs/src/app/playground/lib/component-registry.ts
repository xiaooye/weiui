export interface PropDef {
  name: string;
  type: "select" | "boolean" | "text";
  options?: string[];
  defaultValue: string | boolean;
}

export interface ComponentDef {
  name: string;
  category: string;
  props: PropDef[];
  defaultChildren: string;
}

export const COMPONENTS: ComponentDef[] = [
  {
    name: "Button",
    category: "Form",
    props: [
      { name: "variant", type: "select", options: ["solid", "outline", "ghost", "soft", "link"], defaultValue: "solid" },
      { name: "size", type: "select", options: ["sm", "md", "lg", "xl"], defaultValue: "md" },
      { name: "color", type: "select", options: ["primary", "destructive", "success", "warning"], defaultValue: "primary" },
      { name: "disabled", type: "boolean", defaultValue: false },
      { name: "loading", type: "boolean", defaultValue: false },
    ],
    defaultChildren: "Click me",
  },
  {
    name: "Input",
    category: "Form",
    props: [
      { name: "placeholder", type: "text", defaultValue: "Enter text..." },
      { name: "disabled", type: "boolean", defaultValue: false },
      { name: "invalid", type: "boolean", defaultValue: false },
    ],
    defaultChildren: "",
  },
  {
    name: "Badge",
    category: "Data Display",
    props: [
      { name: "variant", type: "select", options: ["solid", "soft", "outline"], defaultValue: "solid" },
      { name: "color", type: "select", options: ["primary", "destructive", "success", "warning"], defaultValue: "primary" },
    ],
    defaultChildren: "Badge",
  },
  {
    name: "Alert",
    category: "Feedback",
    props: [
      { name: "variant", type: "select", options: ["info", "success", "warning", "destructive"], defaultValue: "info" },
    ],
    defaultChildren: "This is an alert message",
  },
  {
    name: "Spinner",
    category: "Feedback",
    props: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
      { name: "label", type: "text", defaultValue: "Loading" },
    ],
    defaultChildren: "",
  },
];
