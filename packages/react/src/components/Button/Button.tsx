"use client";
import { Children, cloneElement, forwardRef, isValidElement, type ReactElement } from "react";
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
    /** When true, clone the single child and forward button props (router-link integration). */
    asChild?: boolean;
    /** When true, render square padding. Requires `aria-label` for accessibility. */
    iconOnly?: boolean;
    /** When true, the button fills the inline size of its container. */
    fullWidth?: boolean;
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
      asChild = false,
      iconOnly = false,
      fullWidth = false,
      className,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const spinnerSize = size === "lg" ? "md" : "sm";
    const classes = cn(
      buttonVariants({ variant, size, color }),
      iconOnly && "wui-button--icon-only",
      fullWidth && "wui-button--full-width",
      className,
    );

    if (asChild && isValidElement(children)) {
      const child = Children.only(children) as ReactElement<Record<string, unknown>>;
      const childProps = child.props ?? {};
      return cloneElement(child, {
        ...props,
        ref,
        className: cn(classes, childProps.className as string | undefined),
        "data-disabled": disabled || loading || undefined,
        "aria-disabled": disabled || loading || undefined,
      });
    }

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
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
