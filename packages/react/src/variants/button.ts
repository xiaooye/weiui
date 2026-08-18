import { tv } from "tailwind-variants";

/**
 * Maps the tailwind-variants API onto the `civ-button` BEM classes defined in
 * `@civaria/css`. We don't compile Tailwind utilities in consumer apps — the
 * design system ships its styles as plain CSS — so the variant system here is
 * purely a class-name composer.
 */
export const buttonVariants = tv({
  base: "civ-button",
  variants: {
    variant: {
      solid: "civ-button--solid",
      outline: "civ-button--outline",
      ghost: "civ-button--ghost",
      soft: "civ-button--soft",
      link: "civ-button--link",
    },
    size: {
      sm: "civ-button--sm",
      md: "",
      lg: "civ-button--lg",
      xl: "civ-button--xl",
      icon: "civ-button--icon",
    },
    color: {
      primary: "",
      secondary: "",
      destructive: "civ-button--destructive",
      success: "",
      warning: "",
      neutral: "",
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
    color: "primary",
  },
});

export type ButtonVariants = Parameters<typeof buttonVariants>[0];
