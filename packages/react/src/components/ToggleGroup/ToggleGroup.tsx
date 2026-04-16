"use client";
import { createContext, useContext, forwardRef, useState } from "react";
import { cn } from "../../utils/cn";

interface ToggleGroupContextValue {
  selected: string[];
  toggle: (value: string) => void;
  disabled?: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

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

    const selected = controlled !== undefined
      ? (Array.isArray(controlled) ? controlled : controlled ? [controlled] : [])
      : internal;

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
      <ToggleGroupContext.Provider value={{ selected, toggle, disabled }}>
        <div
          ref={ref}
          className={cn("wui-toggle-group", className)}
          role="group"
          aria-label={label}
          data-disabled={disabled || undefined}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
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

export const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, disabled: itemDisabled, className, children, ...props }, ref) => {
    const ctx = useContext(ToggleGroupContext);
    const isActive = ctx?.selected.includes(value) ?? false;
    const isDisabled = itemDisabled || ctx?.disabled;

    return (
      <button
        ref={ref}
        type="button"
        className={cn("wui-toggle-group__item", className)}
        data-active={isActive || undefined}
        data-disabled={isDisabled || undefined}
        aria-pressed={isActive}
        disabled={isDisabled}
        onClick={() => ctx?.toggle(value)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
ToggleGroupItem.displayName = "ToggleGroupItem";
