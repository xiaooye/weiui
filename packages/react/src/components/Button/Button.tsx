"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { buttonVariants, type ButtonVariants } from "../../variants/button";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    loading?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "solid",
      size = "md",
      color = "primary",
      loading = false,
      disabled,
      startIcon,
      endIcon,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, color }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {!loading && startIcon && <span className="wui-button-icon">{startIcon}</span>}
        <span className="wui-button-label">{children}</span>
        {endIcon && <span className="wui-button-icon">{endIcon}</span>}
      </button>
    );
  },
);
Button.displayName = "Button";
