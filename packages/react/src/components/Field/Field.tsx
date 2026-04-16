"use client";
import { createContext, useContext, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { useId } from "@weiui/headless";
import { cn } from "../../utils/cn";

interface FieldContextValue {
  fieldId: string;
  descriptionId: string;
  errorId: string;
  hasError: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext() {
  return useContext(FieldContext);
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  error?: string;
  required?: boolean;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  ({ children, error, required = false, className, ...props }, ref) => {
    const baseId = useId("field");

    return (
      <FieldContext.Provider
        value={{
          fieldId: `${baseId}-input`,
          descriptionId: `${baseId}-desc`,
          errorId: `${baseId}-error`,
          hasError: !!error,
          required,
        }}
      >
        <div ref={ref} className={cn("flex flex-col gap-[var(--wui-spacing-1\\.5)]", className)} {...props}>
          {children}
          {error && (
            <p id={`${baseId}-error`} className="text-sm text-[var(--wui-color-destructive)]" role="alert">
              {error}
            </p>
          )}
        </div>
      </FieldContext.Provider>
    );
  },
);
Field.displayName = "Field";

// Field.Label
export const FieldLabel = forwardRef<HTMLLabelElement, HTMLAttributes<HTMLLabelElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = useFieldContext();
    return (
      <label
        ref={ref}
        htmlFor={ctx?.fieldId}
        className={cn("text-sm font-medium", className)}
        {...props}
      >
        {children}
        {ctx?.required && <span aria-hidden="true" className="text-[var(--wui-color-destructive)] ml-1">*</span>}
      </label>
    );
  },
);
FieldLabel.displayName = "FieldLabel";

// Field.Description
export const FieldDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const ctx = useFieldContext();
    return (
      <p
        ref={ref}
        id={ctx?.descriptionId}
        className={cn("text-sm text-[var(--wui-color-muted-foreground)]", className)}
        {...props}
      />
    );
  },
);
FieldDescription.displayName = "FieldDescription";

// Field.Control — wraps the input and wires aria attributes
export const FieldControl = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    const ctx = useFieldContext();
    return (
      <div
        ref={ref}
        data-invalid={ctx?.hasError || undefined}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  },
);
FieldControl.displayName = "FieldControl";
