"use client";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface BottomNavProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  ({ className, children, ...props }, ref) => (
    <nav ref={ref} className={cn("wui-bottom-nav", className)} aria-label="Bottom navigation" {...props}>
      {children}
    </nav>
  ),
);
BottomNav.displayName = "BottomNav";

export interface BottomNavItemProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
  label: string;
}

export const BottomNavItem = forwardRef<HTMLButtonElement, BottomNavItemProps>(
  ({ active, icon, label, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn("wui-bottom-nav__item", className)}
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {icon && <span className="wui-bottom-nav__icon" aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </button>
  ),
);
BottomNavItem.displayName = "BottomNavItem";
