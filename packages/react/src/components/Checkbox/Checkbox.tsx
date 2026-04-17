"use client";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import { cn } from "../../utils/cn";
import { useFieldContext, computeFieldDescribedBy } from "../Field/Field";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  indeterminate?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
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
  ({ label, className, id, indeterminate, invalid, size = "md", ...props }, ref) => {
    const generatedId = useId();
    const ctx = useFieldContext();
    const inputId = id ?? ctx?.fieldId ?? generatedId;
    const innerRef = useRef<HTMLInputElement | null>(null);
    const resolvedInvalid = invalid ?? ctx?.hasError ?? undefined;
    const describedBy = computeFieldDescribedBy(ctx, props["aria-describedby"] as string | undefined);

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    const setRef = useCallback(mergeRefs<HTMLInputElement>(ref, innerRef), [ref]);

    const sizeClass = size === "sm" ? "wui-checkbox--sm" : size === "lg" ? "wui-checkbox--lg" : "";
    return (
      <div className={cn("wui-checkbox", sizeClass, className)}>
        <input
          ref={setRef}
          type="checkbox"
          id={inputId}
          className="wui-checkbox__input"
          aria-checked={indeterminate ? "mixed" : undefined}
          aria-invalid={resolvedInvalid || undefined}
          data-invalid={resolvedInvalid || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className="wui-checkbox__label">
            {label}
          </label>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
