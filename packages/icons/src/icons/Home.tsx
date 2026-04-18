import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Home = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/>
    </Icon>
  ),
);
Home.displayName = "Home";
