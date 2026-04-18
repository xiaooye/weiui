import { tv } from "tailwind-variants";

/**
 * Maps the tailwind-variants API onto the `wui-button` BEM classes defined in
 * `@weiui/css`. We don't compile Tailwind utilities in consumer apps — the
 * design system ships its styles as plain CSS — so the variant system here is
 * purely a class-name composer.
 */
export const buttonVariants = tv({
  base: "wui-button",
  variants: {
    variant: {
      solid: "wui-button--solid",
      outline: "wui-button--outline",
      ghost: "wui-button--ghost",
      soft: "wui-button--soft",
      link: "wui-button--link",
    },
    size: {
      sm: "wui-button--sm",
      md: "",
      lg: "wui-button--lg",
      xl: "wui-button--xl",
      icon: "wui-button--icon",
    },
    color: {
      primary: "",
      secondary: "",
      destructive: "wui-button--destructive",
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
