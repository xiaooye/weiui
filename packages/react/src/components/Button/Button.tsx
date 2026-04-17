"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { buttonVariants, type ButtonVariants } from "../../variants/button";
import { Spinner } from "../Spinner/Spinner";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    /** Show a spinner and disable the button while an action runs. */
    loading?: boolean;
    /** Node rendered before the label (icon, avatar, etc.). Hidden while `loading`. */
    startIcon?: React.ReactNode;
    /** Node rendered after the label (icon, badge, chevron, etc.). */
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
      type = "button",
      ...props
    },
    ref,
  ) => {
    const spinnerSize = size === "lg" ? "md" : "sm";
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, color }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        {...props}
      >
        {loading && (
          <span className="wui-button-icon" aria-hidden={false}>
            <Spinner size={spinnerSize} />
          </span>
        )}
        {!loading && startIcon && <span className="wui-button-icon">{startIcon}</span>}
        <span className="wui-button-label">{children}</span>
        {endIcon && <span className="wui-button-icon">{endIcon}</span>}
      </button>
    );
  },
);
Button.displayName = "Button";
