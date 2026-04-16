import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "destructive" | "warning";
  indeterminate?: boolean;
  label?: string;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value = 0, max = 100, size = "md", color = "primary", indeterminate, label, className, ...props }, ref) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
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
          className,
        )}
        {...props}
      >
        <div className="wui-progress__bar" style={indeterminate ? undefined : { inlineSize: `${percent}%` }} />
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
