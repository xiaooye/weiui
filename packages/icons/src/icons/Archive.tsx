import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Archive = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" x2="14" y1="12" y2="12"/>
    </Icon>
  ),
);
Archive.displayName = "Archive";
