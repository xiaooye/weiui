import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const ArrowLeft = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </Icon>
  ),
);
ArrowLeft.displayName = "ArrowLeft";
