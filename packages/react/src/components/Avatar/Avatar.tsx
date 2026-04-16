import { forwardRef, type HTMLAttributes, type ReactNode, type ImgHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size = "md", children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "wui-avatar",
        size !== "md" && `wui-avatar--${size}`,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
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
