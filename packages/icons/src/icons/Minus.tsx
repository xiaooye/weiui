import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Minus = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <line x1="5" x2="19" y1="12" y2="12"/>
    </Icon>
  ),
);
Minus.displayName = "Minus";
