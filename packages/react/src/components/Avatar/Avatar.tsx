"use client";
import {
  Children,
  forwardRef,
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg" | "xl";
  /** Display name. Used to auto-generate initials when no image/children are provided. */
  name?: string;
  /** When true (default when `name` is set), pick a deterministic background color from the name. */
  colorFromName?: boolean;
  /** Image source. When provided, Avatar renders an img with automatic onError → fallback swap. */
  src?: string;
  /** Alt text for the image. Defaults to `name`. */
  alt?: string;
  children?: ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? "";
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}

type AvatarColor = "primary" | "success" | "warning" | "destructive";

function colorFromName(name: string): AvatarColor {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) | 0;
  const palette: readonly AvatarColor[] = ["primary", "success", "warning", "destructive"];
  return palette[Math.abs(hash) % palette.length] ?? "primary";
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size = "md", name, colorFromName: colorize, src, alt, children, className, ...props }, ref) => {
    const [imgFailed, setImgFailed] = useState(false);
    const initials = name ? getInitials(name) : "";
    const useColor = colorize ?? (name ? true : false);
    const colorToken = name && useColor ? colorFromName(name) : null;
    const showImage = !!src && !imgFailed;
    const hasChildren = Children.count(children) > 0;

    return (
      <span
        ref={ref}
        className={cn(
          "wui-avatar",
          size !== "md" && `wui-avatar--${size}`,
          colorToken && `wui-avatar--${colorToken}`,
          className,
        )}
        {...props}
      >
        {showImage && (
          <img
            src={src}
            alt={alt ?? name ?? ""}
            className="wui-avatar__image"
            onError={() => setImgFailed(true)}
          />
        )}
        {/*
         * Fallback rendering order:
         *   1. explicit children (backward-compat: AvatarImage+AvatarFallback sub-components)
         *   2. auto-generated initials from `name`
         */}
        {!showImage && hasChildren && children}
        {!showImage && !hasChildren && initials && (
          <span className="wui-avatar__fallback">{initials}</span>
        )}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";

export const AvatarImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt = "", ...props }, ref) => (
    <img ref={ref} className={cn("wui-avatar__image", className)} alt={alt} {...props} />
  ),
);
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("wui-avatar__fallback", className)} {...props} />
  ),
);
AvatarFallback.displayName = "AvatarFallback";

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to show before collapsing into `+N`. */
  max?: number;
  children: ReactNode;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 3, className, ...props }, ref) => {
    const items = Children.toArray(children);
    const visible = items.slice(0, max);
    const overflow = items.length - max;
    return (
      <div ref={ref} className={cn("wui-avatar-group", className)} {...props}>
        {visible}
        {overflow > 0 && (
          <span className="wui-avatar wui-avatar--overflow" aria-label={`${overflow} more`}>
            +{overflow}
          </span>
        )}
      </div>
    );
  },
);
AvatarGroup.displayName = "AvatarGroup";
