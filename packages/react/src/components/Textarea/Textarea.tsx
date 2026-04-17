"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useFieldContext, computeFieldDescribedBy } from "../Field/Field";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, size = "md", ...props }, ref) => {
    const ctx = useFieldContext();
    const sizeClass = size === "sm" ? "wui-input--sm" : size === "lg" ? "wui-input--lg" : "";
    const resolvedId = props.id ?? ctx?.fieldId;
    const resolvedDescribedBy = computeFieldDescribedBy(ctx, props["aria-describedby"] as string | undefined);
    const resolvedInvalid = invalid ?? ctx?.hasError ?? undefined;
    return (
      <textarea
        ref={ref}
        className={cn("wui-input", sizeClass, className)}
        aria-invalid={resolvedInvalid || undefined}
        data-invalid={resolvedInvalid || undefined}
        aria-describedby={resolvedDescribedBy}
        {...props}
        id={resolvedId}
      />
    );
  },
);
Textarea.displayName = "Textarea";
