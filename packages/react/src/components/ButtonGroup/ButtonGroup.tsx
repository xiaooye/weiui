"use client";
import { createContext, forwardRef, useContext, useMemo, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ButtonGroupContextValue {
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  variant?: "attached" | "spaced";
}

const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(null);

export function useButtonGroupContext() {
  return useContext(ButtonGroupContext);
}

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Button children grouped together. */
  children: ReactNode;
  /** Layout orientation. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** `attached` visually joins buttons; `spaced` keeps individual rounded corners with gap. */
  variant?: "attached" | "spaced";
  /** Applied to child buttons that don't specify their own size. */
  size?: "sm" | "md" | "lg" | "xl" | "icon";
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    { className, children, orientation = "horizontal", variant = "attached", size, ...props },
    ref,
  ) => {
    const ctxValue = useMemo<ButtonGroupContextValue>(() => ({ size, variant }), [size, variant]);
    return (
      <ButtonGroupContext.Provider value={ctxValue}>
        <div
          ref={ref}
          className={cn(
            "wui-button-group",
            orientation === "vertical" && "wui-button-group--vertical",
            variant === "spaced" && "wui-button-group--spaced",
            className,
          )}
          role="group"
          data-orientation={orientation}
          data-variant={variant}
          {...props}
        >
          {children}
        </div>
      </ButtonGroupContext.Provider>
    );
  },
);
ButtonGroup.displayName = "ButtonGroup";
