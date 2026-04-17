"use client";
import { createContext, useContext, forwardRef, type HTMLAttributes, type ReactNode, type ButtonHTMLAttributes } from "react";
import { useDisclosure, type UseDisclosureProps } from "@weiui/headless";
import { cn } from "../../utils/cn";

interface SidebarContextValue {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar compound components must be used within <Sidebar>");
  return ctx;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement>, UseDisclosureProps {
  children: ReactNode;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ children, className, defaultOpen, open, onOpenChange, ...props }, ref) => {
    const { isOpen: isCollapsed, onToggle } = useDisclosure({ defaultOpen, open, onOpenChange });

    return (
      <SidebarContext.Provider value={{ isCollapsed, onToggle }}>
        <aside
          ref={ref}
          className={cn("wui-sidebar", className)}
          data-collapsed={isCollapsed ? "" : undefined}
          {...props}
        >
          {children}
        </aside>
      </SidebarContext.Provider>
    );
  },
);
Sidebar.displayName = "Sidebar";

export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-sidebar__header", className)} {...props} />
  ),
);
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-sidebar__content", className)} {...props} />
  ),
);
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-sidebar__footer", className)} {...props} />
  ),
);
SidebarFooter.displayName = "SidebarFooter";

export interface SidebarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** Optional icon node — rendered before the label; always visible even in collapsed mode. */
  icon?: ReactNode;
  children: ReactNode;
}

export const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ active, icon, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn("wui-sidebar__item", className)}
      data-active={active ? "" : undefined}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {icon && <span className="wui-sidebar__icon" aria-hidden="true">{icon}</span>}
      <span className="wui-sidebar__label">{children}</span>
    </button>
  ),
);
SidebarItem.displayName = "SidebarItem";

export { useSidebarContext };
