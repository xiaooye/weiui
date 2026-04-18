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
  successId: string;
  hasDescription: boolean;
  hasError: boolean;
  hasSuccess: boolean;
  required: boolean;
  disabled: boolean;
  validating: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useFieldContext() {
  return useContext(FieldContext);
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Label, input, description, and error children. Order is preserved. */
  children: ReactNode;
  /** Error message. When set, wires `aria-invalid`/`aria-describedby` and renders an alert. */
  error?: string;
  /** Success message. When truthy (and no error), renders a success note and wires `aria-describedby`. */
  success?: boolean | string;
  /** When true, marks the field as validating (pending async check) and renders an inline indicator. */
  validating?: boolean;
  /** Marks the field as required — shown in the label and mirrored to the input. */
  required?: boolean;
  /** Disables the field — propagates `disabled` onto the nested input via context. */
  disabled?: boolean;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  ({ children, error, success, validating = false, required = false, disabled = false, className, ...props }, ref) => {
    const baseId = useId("field");
    const fieldId = `${baseId}-input`;
    const descriptionId = `${baseId}-desc`;
    const errorId = `${baseId}-error`;
    const successId = `${baseId}-success`;
    const hasError = !!error;
    const hasSuccessString = typeof success === "string" && success.length > 0;
    const hasSuccess = !hasError && (success === true || hasSuccessString);

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
          successId,
          hasDescription,
          hasError,
          hasSuccess,
          required,
          disabled,
          validating,
        }}
      >
        <div
          ref={ref}
          className={cn("wui-field", className)}
          data-disabled={disabled || undefined}
          data-validating={validating || undefined}
          data-invalid={hasError || undefined}
          data-success={hasSuccess || undefined}
          {...props}
        >
          {children}
          {hasError && (
            <p id={errorId} className="wui-field__error" role="alert">
              {error}
            </p>
          )}
          {!hasError && hasSuccessString && (
            <p id={successId} className="wui-field__success">
              {success as string}
            </p>
          )}
          {validating && (
            <p className="wui-field__validating" aria-live="polite">
              Validating…
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
        className={cn("wui-label", className)}
        {...props}
      >
        {children}
        {ctx?.required && <span aria-hidden="true" className="wui-label__required">*</span>}
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
        className={cn("wui-field__description", className)}
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
  if (ctx.hasSuccess) ids.push(ctx.successId);
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
      if (ctx.disabled && childProps.disabled == null) {
        nextProps.disabled = true;
      }
      content = cloneElement(child, nextProps);
    }

    return (
      <div
        ref={ref}
        data-invalid={ctx?.hasError || undefined}
        data-disabled={ctx?.disabled || undefined}
        className={className}
        {...props}
      >
        {content}
      </div>
    );
  },
);
FieldControl.displayName = "FieldControl";
