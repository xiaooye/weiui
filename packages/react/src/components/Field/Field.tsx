"use client";
import {
  createContext,
  useContext,
  forwardRef,
  cloneElement,
  isValidElement,
  Children,
  type HTMLAttributes,
  type ReactNode,
  type ReactElement,
} from "react";
import { useId } from "@weiui/headless";
import { cn } from "../../utils/cn";

export interface FieldContextValue {
  fieldId: string;
  descriptionId: string;
  errorId: string;
  hasDescription: boolean;
  hasError: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext() {
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
    const fieldId = `${baseId}-input`;
    const descriptionId = `${baseId}-desc`;
    const errorId = `${baseId}-error`;
    const hasError = !!error;

    // Detect whether a FieldDescription is present so consumers can wire aria-describedby cleanly.
    let hasDescription = false;
    Children.forEach(children, (child) => {
      if (isValidElement(child) && (child.type as { displayName?: string })?.displayName === "FieldDescription") {
        hasDescription = true;
      }
    });

    return (
      <FieldContext.Provider
        value={{
          fieldId,
          descriptionId,
          errorId,
          hasDescription,
          hasError,
          required,
        }}
      >
        <div ref={ref} className={cn("flex flex-col gap-[var(--wui-spacing-1\\.5)]", className)} {...props}>
          {children}
          {error && (
            <p id={errorId} className="text-sm text-[var(--wui-color-destructive)]" role="alert">
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

/**
 * Computed describedby ID list from Field context plus an existing value.
 * Exported so primitives like Input/Textarea/Select can wire themselves when
 * they are nested inside a Field without a FieldControl wrapper.
 */
export function computeFieldDescribedBy(
  ctx: FieldContextValue | null,
  existing: string | undefined,
): string | undefined {
  if (!ctx) return existing;
  const ids: string[] = [];
  if (existing) ids.push(existing);
  if (ctx.hasDescription) ids.push(ctx.descriptionId);
  if (ctx.hasError) ids.push(ctx.errorId);
  return ids.length ? ids.join(" ") : undefined;
}

// Field.Control — wraps the input and clones its single child with wired ARIA attributes.
export const FieldControl = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    const ctx = useFieldContext();

    let content: ReactNode = children;
    if (ctx && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childProps = child.props;
      const existingDescribedBy = childProps["aria-describedby"] as string | undefined;
      const describedBy = computeFieldDescribedBy(ctx, existingDescribedBy);

      const nextProps: Record<string, unknown> = {};
      if (childProps.id == null) nextProps.id = ctx.fieldId;
      if (describedBy) nextProps["aria-describedby"] = describedBy;
      if (ctx.hasError && childProps["aria-invalid"] == null) {
        nextProps["aria-invalid"] = true;
      }
      content = cloneElement(child, nextProps);
    }

    return (
      <div
        ref={ref}
        data-invalid={ctx?.hasError || undefined}
        className={className}
        {...props}
      >
        {content}
      </div>
    );
  },
);
FieldControl.displayName = "FieldControl";
