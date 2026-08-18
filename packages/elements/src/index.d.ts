export interface WeiElementItem { value: string; label?: string; content?: string; disabled?: boolean; }
export class CivButtonElement extends HTMLElement {}
export class CivBadgeElement extends HTMLElement {}
export class CivCardElement extends HTMLElement {}
export class CivDividerElement extends HTMLElement {}
export class CivSkeletonElement extends HTMLElement {}
export class CivSpinnerElement extends HTMLElement {}
export class CivContainerElement extends HTMLElement {}
export class CivStackElement extends HTMLElement {}
export class CivGridElement extends HTMLElement {}
export class CivAspectRatioElement extends HTMLElement {}
export class CivAccordionElement extends HTMLElement { items: WeiElementItem[]; }
export class CivDialogElement extends HTMLElement {}
export class CivMenuElement extends HTMLElement { items: WeiElementItem[]; }
export class CivPopoverElement extends HTMLElement {}
export class CivSelectElement extends HTMLElement { items: WeiElementItem[]; value: string; }
export class CivTabsElement extends HTMLElement { items: WeiElementItem[]; }
export class CivTooltipElement extends HTMLElement {}
export class CivComboboxElement extends HTMLElement { items: WeiElementItem[]; }
export class CivCheckboxElement extends HTMLElement {}
export class CivSwitchElement extends HTMLElement {}
export function defineButton(): void; export function defineAccordion(): void; export function defineDialog(): void; export function defineMenu(): void; export function definePopover(): void; export function defineSelect(): void; export function defineTabs(): void; export function defineTooltip(): void; export function defineCombobox(): void; export function defineCheckbox(): void; export function defineSwitch(): void; export function defineAll(): void;
export function normalizeElementProps(element: HTMLElement, dom?: unknown): void;
declare global { interface HTMLElementTagNameMap { "civ-button": CivButtonElement; "civ-accordion": CivAccordionElement; "civ-dialog": CivDialogElement; "civ-menu": CivMenuElement; "civ-popover": CivPopoverElement; "civ-select": CivSelectElement; "civ-tabs": CivTabsElement; "civ-tooltip": CivTooltipElement; "civ-combobox": CivComboboxElement; "civ-checkbox": CivCheckboxElement; "civ-switch": CivSwitchElement; } }
