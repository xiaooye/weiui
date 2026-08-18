import type { Component, Snippet } from "svelte";
export interface WeiItem { value: string; label?: string; content?: string; disabled?: boolean; }
export interface VisualProps { variant?: string; size?: string; class?: string; children?: Snippet; }
export const Button: Component<VisualProps>; export const Badge: Component<VisualProps>; export const Card: Component<VisualProps>; export const Divider: Component<VisualProps>; export const Skeleton: Component<VisualProps>; export const Spinner: Component<VisualProps>; export const Container: Component<VisualProps>; export const Stack: Component<VisualProps>; export const Grid: Component<VisualProps>; export const AspectRatio: Component<VisualProps>;
export const Accordion: Component<{ items?: WeiItem[]; value?: string[]; type?: "single"|"multiple"; id?: string }>;
export const Dialog: Component<{ open?: boolean; trigger?: string; title?: string; description?: string; closeLabel?: string; id?: string; children?: Snippet }>;
export const Menu: Component<{ items?: WeiItem[]; trigger?: string; id?: string; onselect?: (value:string)=>void }>;
export const Popover: Component<{ open?: boolean; trigger?: string; closeLabel?: string; id?: string; children?: Snippet }>;
export const Select: Component<{ items?: WeiItem[]; value?: string; placeholder?: string; id?: string }>;
export const Tabs: Component<{ items?: WeiItem[]; value?: string; orientation?: "horizontal"|"vertical"; id?: string }>;
export const Tooltip: Component<{ content: string; delay?: number; id?: string; children?: Snippet }>;
export const Combobox: Component<{ items?: WeiItem[]; value?: string; inputValue?: string; placeholder?: string; id?: string }>;
export const Checkbox: Component<{ checked?: boolean; defaultChecked?: boolean; disabled?: boolean; label?: string; name?: string; value?: string; id?: string }>;
export const Switch: Component<{ checked?: boolean; defaultChecked?: boolean; disabled?: boolean; label?: string; name?: string; value?: string; id?: string }>;
export function normalizeSvelteProps(dom?: { attributes?: Readonly<Record<string, string|number|boolean|null|undefined>>; listeners?: Readonly<Record<string,(event:unknown)=>void>>; style?: Readonly<Record<string,string|number|undefined>> }): Record<string, unknown>;
