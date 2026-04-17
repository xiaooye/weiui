import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-medium select-none whitespace-nowrap",
    "border-2 border-transparent",
    "focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--wui-color-ring)]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    "min-h-[44px] min-w-[44px]",
    "motion-safe:transition-[transform,box-shadow,background-color,border-color,color]",
    "motion-safe:duration-[var(--wui-motion-duration-fast)]",
    "motion-safe:ease-[var(--wui-motion-easing-standard)]",
  ],
  variants: {
    variant: {
      solid: [
        "text-[var(--wui-color-primary-foreground)]",
        "shadow-[inset_0_1px_0_0_oklch(from_var(--wui-color-primary-foreground)_l_c_h_/_0.12)]",
        "motion-safe:hover:-translate-y-px",
        "motion-safe:hover:shadow-[var(--wui-shadow-sm),inset_0_1px_0_0_oklch(from_var(--wui-color-primary-foreground)_l_c_h_/_0.18)]",
        "motion-safe:active:translate-y-0",
      ],
      outline: [
        "bg-transparent",
        "motion-safe:hover:-translate-y-px",
      ],
      ghost: "bg-transparent",
      soft: [
        "motion-safe:hover:-translate-y-px",
      ],
      link: "bg-transparent underline-offset-4 hover:underline p-0 min-h-0 min-w-0 shadow-none",
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
    { variant: "solid", color: "primary", className: "bg-[var(--wui-color-primary)]" },
    { variant: "solid", color: "destructive", className: "bg-[var(--wui-color-destructive)] text-[var(--wui-color-destructive-foreground)] shadow-[inset_0_1px_0_0_oklch(from_var(--wui-color-destructive-foreground)_l_c_h_/_0.12)] motion-safe:hover:shadow-[var(--wui-shadow-sm),inset_0_1px_0_0_oklch(from_var(--wui-color-destructive-foreground)_l_c_h_/_0.18)]" },
    { variant: "solid", color: "success", className: "bg-[var(--wui-color-success)] text-[var(--wui-color-success-foreground)] shadow-[inset_0_1px_0_0_oklch(from_var(--wui-color-success-foreground)_l_c_h_/_0.12)]" },
    { variant: "outline", color: "primary", className: "border-[var(--wui-color-primary)] text-[var(--wui-color-primary)] hover:bg-[color-mix(in_oklch,var(--wui-color-primary)_8%,transparent)]" },
    { variant: "ghost", color: "primary", className: "text-[var(--wui-color-primary)] hover:bg-[color-mix(in_oklch,var(--wui-color-primary)_8%,transparent)]" },
    { variant: "soft", color: "primary", className: "bg-[color-mix(in_oklch,var(--wui-color-primary)_10%,transparent)] text-[var(--wui-color-primary)] hover:bg-[color-mix(in_oklch,var(--wui-color-primary)_15%,transparent)]" },
  ],
  defaultVariants: {
    variant: "solid",
    size: "md",
    color: "primary",
  },
});

export type ButtonVariants = Parameters<typeof buttonVariants>[0];
