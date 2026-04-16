import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface AppBarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export const AppBar = forwardRef<HTMLElement, AppBarProps>(
  ({ className, children, ...props }, ref) => (
    <header ref={ref} className={cn("wui-app-bar", className)} {...props}>
      {children}
    </header>
  ),
);
AppBar.displayName = "AppBar";

export const AppBarBrand = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-app-bar__brand", className)} {...props} />
  ),
);
AppBarBrand.displayName = "AppBarBrand";

export const AppBarNav = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <nav ref={ref} className={cn("wui-app-bar__nav", className)} {...props} />
  ),
);
AppBarNav.displayName = "AppBarNav";

export interface AppBarLinkProps extends HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const AppBarLink = forwardRef<HTMLButtonElement, AppBarLinkProps>(
  ({ active, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn("wui-app-bar__link", className)}
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      {...props}
    />
  ),
);
AppBarLink.displayName = "AppBarLink";

export const AppBarActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("wui-app-bar__actions", className)} {...props} />
  ),
);
AppBarActions.displayName = "AppBarActions";
