"use client";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";
import { useFieldContext, computeFieldDescribedBy } from "../Field/Field";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visible label rendered next to the checkbox. */
  label?: string;
  /** Renders the mixed/partial state; toggled back to checked on click. */
  indeterminate?: boolean;
  /** Marks the checkbox as invalid. Falls back to the parent `<Field>` error state when omitted. */
  invalid?: boolean;
  /** Visual size. Controls the box dimensions and label font size. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Helper text rendered beneath the label and wired to `aria-describedby`. */
  description?: ReactNode;
  /** When truthy, marks the input invalid. A string renders the message wired to `aria-describedby`. */
  error?: boolean | string;
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as React.MutableRefObject<T | null>).current = value;
    }
  };
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, className, id, indeterminate, invalid, size = "md", description, error, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const ctx = useFieldContext();
    const inputId = id ?? ctx?.fieldId ?? generatedId;
    const descriptionId = `${inputId}-desc`;
    const errorId = `${inputId}-error`;
    const hasDescription = description != null;
    const hasErrorString = typeof error === "string" && error.length > 0;
    const isInvalid = Boolean(invalid ?? ctx?.hasError ?? (typeof error === "boolean" ? error : hasErrorString || undefined));

    const innerRef = useRef<HTMLInputElement | null>(null);

    const extraDescribedBy: string[] = [];
    if (hasDescription) extraDescribedBy.push(descriptionId);
    if (hasErrorString) extraDescribedBy.push(errorId);
    const existingDescribedBy = props["aria-describedby"] as string | undefined;
    const combined = [existingDescribedBy, ...extraDescribedBy].filter(Boolean).join(" ") || undefined;
    const describedBy = computeFieldDescribedBy(ctx, combined);

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    const setRef = useCallback(mergeRefs<HTMLInputElement>(ref, innerRef), [ref]);

    const sizeClass = size === "sm" ? "wui-checkbox--sm" : size === "lg" ? "wui-checkbox--lg" : "";
    const resolvedDisabled = props.disabled ?? ctx?.disabled;
    return (
      <div className={cn("wui-checkbox", sizeClass, className)}>
        <div className="wui-checkbox__row">
          <input
            ref={setRef}
            type="checkbox"
            id={inputId}
            className="wui-checkbox__input"
            aria-checked={indeterminate ? "mixed" : undefined}
            aria-invalid={isInvalid || undefined}
            data-invalid={isInvalid || undefined}
            aria-describedby={describedBy}
            {...props}
            disabled={resolvedDisabled}
          />
          {label && (
            <label htmlFor={inputId} className="wui-checkbox__label">
              {label}
            </label>
          )}
        </div>
        {hasDescription && (
          <p id={descriptionId} className="wui-checkbox__description">
            {description}
          </p>
        )}
        {hasErrorString && (
          <p id={errorId} className="wui-checkbox__error" role="alert">
            {error as string}
          </p>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
