export interface VisualProps { variant?: string; size?: string; }
export interface WeiItem { value: string; label?: string; content?: unknown; disabled?: boolean; }
export interface WeiVueComponent<Props extends object = Record<string, never>> { new (): { $props: Props & { class?: unknown } }; }
export const Button: WeiVueComponent<VisualProps>;
export const Badge: WeiVueComponent<VisualProps>;
export const Card: WeiVueComponent<VisualProps>;
export const Divider: WeiVueComponent<VisualProps>;
export const Skeleton: WeiVueComponent<VisualProps>;
export const Spinner: WeiVueComponent<VisualProps>;
export const Container: WeiVueComponent<VisualProps>;
export const Stack: WeiVueComponent<VisualProps>;
export const Grid: WeiVueComponent<VisualProps>;
export const AspectRatio: WeiVueComponent<VisualProps>;
export const Accordion: WeiVueComponent<{ items?: WeiItem[]; id?: string; type?: "single"|"multiple"; modelValue?: string[]; defaultValue?: string[] }>;
export const Dialog: WeiVueComponent<{ id?: string; modelValue?: boolean; defaultOpen?: boolean; trigger?: string; title?: string; description?: string; teleport?: boolean }>;
export const Menu: WeiVueComponent<{ items?: WeiItem[]; id?: string; trigger?: string }>;
export const Popover: WeiVueComponent<{ id?: string; modelValue?: boolean; defaultOpen?: boolean; trigger?: string }>;
export const Select: WeiVueComponent<{ items?: WeiItem[]; id?: string; modelValue?: string; defaultValue?: string; placeholder?: string }>;
export const Tabs: WeiVueComponent<{ items?: WeiItem[]; id?: string; modelValue?: string; defaultValue?: string; orientation?: "horizontal"|"vertical" }>;
export const Tooltip: WeiVueComponent<{ id?: string; content: string; delay?: number }>;
export const Combobox: WeiVueComponent<{ items?: WeiItem[]; id?: string; modelValue?: string; defaultValue?: string; inputValue?: string; placeholder?: string }>;
export const Checkbox: WeiVueComponent<{ id?: string; modelValue?: boolean; defaultChecked?: boolean; disabled?: boolean; label?: string; name?: string; value?: string }>;
export const Switch: WeiVueComponent<{ id?: string; modelValue?: boolean; defaultChecked?: boolean; disabled?: boolean; label?: string; name?: string; value?: string }>;
export function normalizeVueProps(dom?: { attributes?: Readonly<Record<string, string|number|boolean|null|undefined>>; listeners?: Readonly<Record<string, (event: unknown)=>void>>; style?: Readonly<Record<string, string|number|undefined>> }): Record<string, unknown>;
