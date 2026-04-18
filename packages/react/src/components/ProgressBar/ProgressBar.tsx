import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value. @default 0 */
  value?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Size variant. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Color scheme. @default "primary" */
  color?: "primary" | "success" | "destructive" | "warning";
  /** Shows an indeterminate animation (progress is unknown). */
  indeterminate?: boolean;
  /** Accessible label for the progress bar. */
  label?: string;
  /** When true, overlays the percent (e.g. "42%") centered above the bar. Ignored for indeterminate. */
  showLabel?: boolean;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    { value = 0, max = 100, size = "md", color = "primary", indeterminate, label, showLabel, className, ...props },
    ref,
  ) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    const displayLabel = showLabel && !indeterminate;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || "Progress"}
        className={cn(
          "wui-progress",
          size !== "md" && `wui-progress--${size}`,
          color !== "primary" && `wui-progress--${color}`,
          indeterminate && "wui-progress--indeterminate",
          displayLabel && "wui-progress--with-label",
          className,
        )}
        {...props}
      >
        <div className="wui-progress__bar" style={indeterminate ? undefined : { inlineSize: `${percent}%` }} />
        {displayLabel && (
          <span className="wui-progress__label" aria-hidden="true">
            {Math.round(percent)}%
          </span>
        )}
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
