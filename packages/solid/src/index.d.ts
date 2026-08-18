export interface WeiItem { value: string; label?: string; content?: unknown; disabled?: boolean; }
export interface VisualProps { variant?: string; size?: string; class?: string; children?: unknown; }
export type WeiSolidComponent<Props extends object = { children?: unknown }> = (props: Props) => unknown;
export const Button: WeiSolidComponent<VisualProps>;
export const Badge: WeiSolidComponent<VisualProps>;
export const Card: WeiSolidComponent<VisualProps>;
export const Divider: WeiSolidComponent<VisualProps>;
export const Skeleton: WeiSolidComponent<VisualProps>;
export const Spinner: WeiSolidComponent<VisualProps>;
export const Container: WeiSolidComponent<VisualProps>;
export const Stack: WeiSolidComponent<VisualProps>;
export const Grid: WeiSolidComponent<VisualProps>;
export const AspectRatio: WeiSolidComponent<VisualProps>;
export function Accordion(props?: { items?: WeiItem[]; id?: string; type?: "single"|"multiple"; value?: readonly string[]; defaultValue?: readonly string[]; onValueChange?: (value: readonly string[])=>void }): unknown;
export function Dialog(props?: { id?: string; open?: boolean; defaultOpen?: boolean; trigger?: string; title?: string; description?: string; closeLabel?: string; portal?: boolean; children?: unknown; onOpenChange?: (open:boolean)=>void }): unknown;
export function Menu(props?: { items?: WeiItem[]; id?: string; trigger?: string; onSelect?: (value:string)=>void; onOpenChange?: (open:boolean)=>void }): unknown;
export function Popover(props?: { id?: string; open?: boolean; defaultOpen?: boolean; trigger?: string; closeLabel?: string; children?: unknown; onOpenChange?: (open:boolean)=>void }): unknown;
export function Select(props?: { items?: WeiItem[]; id?: string; value?: string; defaultValue?: string; placeholder?: string; onValueChange?: (value:string)=>void; onOpenChange?: (open:boolean)=>void }): unknown;
export function Tabs(props?: { items?: WeiItem[]; id?: string; value?: string; defaultValue?: string; orientation?: "horizontal"|"vertical"; onValueChange?: (value:string)=>void }): unknown;
export function Tooltip(props?: { id?: string; content?: unknown; delay?: number; children?: unknown; onOpenChange?: (open:boolean)=>void }): unknown;
export function Combobox(props?: { items?: WeiItem[]; id?: string; value?: string; defaultValue?: string; inputValue?: string; placeholder?: string; onValueChange?: (value:string)=>void; onInputValueChange?: (value:string)=>void; onOpenChange?: (open:boolean)=>void }): unknown;
export function Checkbox(props?: { id?: string; checked?: boolean; defaultChecked?: boolean; disabled?: boolean; label?: string; name?: string; value?: string; children?: unknown; onCheckedChange?: (checked:boolean)=>void }): unknown;
export function Switch(props?: { id?: string; checked?: boolean; defaultChecked?: boolean; disabled?: boolean; label?: string; name?: string; value?: string; children?: unknown; onCheckedChange?: (checked:boolean)=>void }): unknown;
export function normalizeSolidProps(dom?: { attributes?: Readonly<Record<string, string|number|boolean|null|undefined>>; listeners?: Readonly<Record<string, (event: unknown)=>void>>; style?: Readonly<Record<string, string|number|undefined>> }): Record<string, unknown>;
