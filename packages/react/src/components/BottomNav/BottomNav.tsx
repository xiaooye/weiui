"use client";
import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

interface BottomNavContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  showLabels: "always" | "active" | "never";
}

const BottomNavContext = createContext<BottomNavContextValue | null>(null);

export interface BottomNavProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Controlled active item value. */
  value?: string;
  /** Called when a BottomNavItem with a `value` prop is clicked. */
  onValueChange?: (value: string) => void;
  /** Label display mode. `always` (default), `active` (only active item shows label), `never`. */
  showLabels?: "always" | "active" | "never";
}

export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  ({ className, children, value, onValueChange, showLabels = "always", ...props }, ref) => (
    <BottomNavContext.Provider value={{ value, onValueChange, showLabels }}>
      <nav
        ref={ref}
        className={cn("wui-bottom-nav", className)}
        data-show-labels={showLabels}
        aria-label="Bottom navigation"
        {...props}
      >
        {children}
      </nav>
    </BottomNavContext.Provider>
  ),
);
BottomNav.displayName = "BottomNav";

export interface BottomNavItemProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
  label: string;
  /** Value for controlled BottomNav `onValueChange`. When provided, parent drives `active`. */
  value?: string;
  /** Badge slot (e.g. a number or dot indicator). */
  badge?: ReactNode;
}

export const BottomNavItem = forwardRef<HTMLButtonElement, BottomNavItemProps>(
  ({ active, icon, label, value, badge, className, onClick, ...props }, ref) => {
    const ctx = useContext(BottomNavContext);
    const resolvedActive = active ?? (ctx?.value !== undefined && ctx.value === value);
    return (
      <button
        ref={ref}
        type="button"
        className={cn("wui-bottom-nav__item", className)}
        data-active={resolvedActive || undefined}
        aria-current={resolvedActive ? "page" : undefined}
        onClick={(e) => {
          if (value !== undefined) ctx?.onValueChange?.(value);
          onClick?.(e);
        }}
        {...props}
      >
        {icon && (
          <span className="wui-bottom-nav__icon-wrapper">
            <span className="wui-bottom-nav__icon" aria-hidden="true">
              {icon}
            </span>
            {badge !== undefined && badge !== null && badge !== false && (
              <span className="wui-bottom-nav__badge" aria-hidden="true">
                {badge}
              </span>
            )}
          </span>
        )}
        <span className="wui-bottom-nav__label" data-active={resolvedActive || undefined}>
          {label}
        </span>
      </button>
    );
  },
);
BottomNavItem.displayName = "BottomNavItem";
