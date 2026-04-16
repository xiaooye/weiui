import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Check = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <polyline points="20 6 9 17 4 12"/>
    </Icon>
  ),
);
Check.displayName = "Check";
