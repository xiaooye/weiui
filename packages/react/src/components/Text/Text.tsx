import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  color?: "foreground" | "muted" | "primary" | "destructive" | "success";
  weight?: "regular" | "medium" | "semibold" | "bold";
  as?: "p" | "span" | "div";
  children: ReactNode;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = "base", color = "foreground", weight, as: Tag = "p", children, className, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn(
          `text-${size}`,
          color === "muted" && "text-[var(--wui-color-muted-foreground)]",
          color === "primary" && "text-[var(--wui-color-primary)]",
          color === "destructive" && "text-[var(--wui-color-destructive)]",
          color === "success" && "text-[var(--wui-color-success)]",
          weight && `font-${weight}`,
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);
Text.displayName = "Text";
