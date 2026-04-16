"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn("wui-input", className)}
        aria-invalid={invalid || undefined}
        data-invalid={invalid || undefined}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
