import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Zap = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </Icon>
  ),
);
Zap.displayName = "Zap";
