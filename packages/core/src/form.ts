import { semanticPart, type WeiDOMProps } from "./dom";

export interface HiddenFormControlOptions {
  component: string;
  name?: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
}

/** Framework-neutral form serialization contract for composite controls. */
export function createHiddenFormControl(options: HiddenFormControlOptions): WeiDOMProps {
  return {
    attributes: {
      ...semanticPart(options.component, "hiddenInput"),
      type: "hidden",
      name: options.name,
      value: options.value,
      disabled: options.disabled || undefined,
      "data-required": options.required || undefined,
      "aria-hidden": true,
    },
  };
}

export function isFormValuePresent(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).length > 0;
}
