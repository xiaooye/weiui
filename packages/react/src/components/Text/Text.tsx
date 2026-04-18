import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Font size token. @default "base" */
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  /** Foreground color token. @default "foreground" */
  color?: "foreground" | "muted" | "primary" | "destructive" | "success";
  /** Font weight. */
  weight?: "regular" | "medium" | "semibold" | "bold";
  /** Element tag to render. @default "p" */
  as?: "p" | "span" | "div";
  /** Text content. */
  children: ReactNode;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = "base", color = "foreground", weight, as: Tag = "p", children, className, ...props }, ref) => {
    return (
      <Tag
        ref={ref}
        className={cn(
          "wui-text",
          `wui-text--${size}`,
          color !== "foreground" && `wui-text--${color}`,
          weight && `wui-text--weight-${weight}`,
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
