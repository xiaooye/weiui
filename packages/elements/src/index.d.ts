export interface WeiElementItem { value: string; label?: string; content?: string; disabled?: boolean; }
export class WuiButtonElement extends HTMLElement {}
export class WuiBadgeElement extends HTMLElement {}
export class WuiCardElement extends HTMLElement {}
export class WuiDividerElement extends HTMLElement {}
export class WuiSkeletonElement extends HTMLElement {}
export class WuiSpinnerElement extends HTMLElement {}
export class WuiContainerElement extends HTMLElement {}
export class WuiStackElement extends HTMLElement {}
export class WuiGridElement extends HTMLElement {}
export class WuiAspectRatioElement extends HTMLElement {}
export class WuiAccordionElement extends HTMLElement { items: WeiElementItem[]; }
export class WuiDialogElement extends HTMLElement {}
export class WuiMenuElement extends HTMLElement { items: WeiElementItem[]; }
export class WuiPopoverElement extends HTMLElement {}
export class WuiSelectElement extends HTMLElement { items: WeiElementItem[]; value: string; }
export class WuiTabsElement extends HTMLElement { items: WeiElementItem[]; }
export class WuiTooltipElement extends HTMLElement {}
export class WuiComboboxElement extends HTMLElement { items: WeiElementItem[]; }
export class WuiCheckboxElement extends HTMLElement {}
export class WuiSwitchElement extends HTMLElement {}
export function defineButton(): void; export function defineAccordion(): void; export function defineDialog(): void; export function defineMenu(): void; export function definePopover(): void; export function defineSelect(): void; export function defineTabs(): void; export function defineTooltip(): void; export function defineCombobox(): void; export function defineCheckbox(): void; export function defineSwitch(): void; export function defineAll(): void;
export function normalizeElementProps(element: HTMLElement, dom?: unknown): void;
declare global { interface HTMLElementTagNameMap { "wui-button": WuiButtonElement; "wui-accordion": WuiAccordionElement; "wui-dialog": WuiDialogElement; "wui-menu": WuiMenuElement; "wui-popover": WuiPopoverElement; "wui-select": WuiSelectElement; "wui-tabs": WuiTabsElement; "wui-tooltip": WuiTooltipElement; "wui-combobox": WuiComboboxElement; "wui-checkbox": WuiCheckboxElement; "wui-switch": WuiSwitchElement; } }
