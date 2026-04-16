"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";

export interface ToggleGroupProps {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  label?: string;
}

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ type = "single", value: controlled, defaultValue, onChange, disabled, className, children, label }, ref) => {
    const [internal, setInternal] = useState<string[]>(() => {
      const def = defaultValue ?? (type === "multiple" ? [] : "");
      return Array.isArray(def) ? def : def ? [def] : [];
    });

    const selected = controlled !== undefined ? (Array.isArray(controlled) ? controlled : [controlled]) : internal;

    const toggle = (val: string) => {
      if (disabled) return;
      let next: string[];
      if (type === "single") {
        next = selected.includes(val) ? [] : [val];
      } else {
        next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val];
      }
      if (controlled === undefined) setInternal(next);
      onChange?.(type === "single" ? (next[0] ?? "") : next);
    };

    return (
      <div
        ref={ref}
        className={cn("wui-toggle-group", className)}
        role="group"
        aria-label={label}
        data-disabled={disabled || undefined}
      >
        {Array.isArray(children)
          ? children.map((child) => {
              if (!child || typeof child !== "object" || !("props" in child)) return child;
              const val = (child as React.ReactElement<ToggleGroupItemProps>).props.value;
              return (
                <ToggleGroupItemInternal
                  key={val}
                  {...(child as React.ReactElement<ToggleGroupItemProps>).props}
                  isActive={selected.includes(val)}
                  onToggle={() => toggle(val)}
                  disabled={disabled}
                />
              );
            })
          : children}
      </div>
    );
  },
);
ToggleGroup.displayName = "ToggleGroup";

export interface ToggleGroupItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

function ToggleGroupItemInternal({ value, isActive, onToggle, disabled, className, children }: ToggleGroupItemProps & { isActive: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={cn("wui-toggle-group__item", className)}
      data-active={isActive || undefined}
      data-disabled={disabled || undefined}
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onToggle}
    >
      {children}
    </button>
  );
}

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, className, children, ...props }, ref) => (
    <button ref={ref} type="button" className={cn("wui-toggle-group__item", className)} data-value={value} {...props}>
      {children}
    </button>
  ),
);
ToggleGroupItem.displayName = "ToggleGroupItem";
