import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wui-color-ring)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "min-h-[44px] min-w-[44px]",
  ],
  variants: {
    variant: {
      solid: "text-[var(--wui-color-primary-foreground)]",
      outline: "border-2 bg-transparent",
      ghost: "bg-transparent",
      soft: "bg-opacity-10",
      link: "bg-transparent underline-offset-4 hover:underline p-0 min-h-0 min-w-0",
    },
    size: {
      sm: "h-9 px-3 text-sm rounded-[var(--wui-shape-radius-base)]",
      md: "h-11 px-4 text-sm rounded-[var(--wui-shape-radius-md)]",
      lg: "h-12 px-6 text-base rounded-[var(--wui-shape-radius-md)]",
      xl: "h-14 px-8 text-lg rounded-[var(--wui-shape-radius-lg)]",
      icon: "size-11 rounded-[var(--wui-shape-radius-md)]",
    },
    color: {
      primary: "",
      secondary: "",
      destructive: "",
      success: "",
      warning: "",
      neutral: "",
    },
  },
  compoundVariants: [
    { variant: "solid", color: "primary", className: "bg-[var(--wui-color-primary)] hover:brightness-110 active:brightness-95" },
    { variant: "solid", color: "destructive", className: "bg-[var(--wui-color-destructive)] hover:brightness-110 active:brightness-95" },
    { variant: "outline", color: "primary", className: "border-[var(--wui-color-primary)] text-[var(--wui-color-primary)] hover:bg-[var(--wui-color-primary)]/5" },
    { variant: "ghost", color: "primary", className: "text-[var(--wui-color-primary)] hover:bg-[var(--wui-color-primary)]/5" },
    { variant: "soft", color: "primary", className: "bg-[var(--wui-color-primary)]/10 text-[var(--wui-color-primary)] hover:bg-[var(--wui-color-primary)]/15" },
  ],
  defaultVariants: {
    variant: "solid",
    size: "md",
    color: "primary",
  },
});

export type ButtonVariants = Parameters<typeof buttonVariants>[0];
