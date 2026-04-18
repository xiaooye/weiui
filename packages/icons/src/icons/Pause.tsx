import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Pause = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/>
    </Icon>
  ),
);
Pause.displayName = "Pause";
