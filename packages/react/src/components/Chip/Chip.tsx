import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

type CommonProps = {
  children: ReactNode;
  color?: "default" | "primary" | "success" | "destructive";
  /** Icon rendered before the label. */
  icon?: ReactNode;
  /** Visual size. */
  size?: "sm" | "md" | "lg";
  /** Outlined visual variant (transparent fill). */
  variant?: "filled" | "outlined";
  /** Dims the chip and blocks interaction. */
  disabled?: boolean;
  onRemove?: () => void;
};

export type ChipProps =
  | (CommonProps & Omit<HTMLAttributes<HTMLSpanElement>, "color" | "onClick"> & { onClick?: undefined })
  | (CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & { onClick: React.MouseEventHandler<HTMLButtonElement> });

export const Chip = forwardRef<HTMLElement, ChipProps>((props, ref) => {
  const {
    children,
    color = "default",
    icon,
    size = "md",
    variant = "filled",
    disabled,
    onRemove,
    className,
    onClick,
    ...rest
  } = props as CommonProps & { className?: string; onClick?: React.MouseEventHandler<HTMLButtonElement> };

  const classes = cn(
    "wui-chip",
    color !== "default" && `wui-chip--${color}`,
    size !== "md" && `wui-chip--${size}`,
    variant === "outlined" && "wui-chip--outlined",
    disabled && "wui-chip--disabled",
    onClick && "wui-chip--clickable",
    className,
  );

  const content = (
    <>
      {icon && <span className="wui-chip__icon" aria-hidden="true">{icon}</span>}
      <span className="wui-chip__label">{children}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          className="wui-chip__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        onClick={onClick}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={classes}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      {...(rest as HTMLAttributes<HTMLSpanElement>)}
    >
      {content}
    </span>
  );
}) as React.ForwardRefExoticComponent<ChipProps & React.RefAttributes<HTMLElement>>;
Chip.displayName = "Chip";
