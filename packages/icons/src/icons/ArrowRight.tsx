import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const ArrowRight = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </Icon>
  ),
);
ArrowRight.displayName = "ArrowRight";
