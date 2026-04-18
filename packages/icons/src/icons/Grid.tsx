import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Grid = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <rect width="7" height="7" x="3" y="3"/><rect width="7" height="7" x="14" y="3"/><rect width="7" height="7" x="14" y="14"/><rect width="7" height="7" x="3" y="14"/>
    </Icon>
  ),
);
Grid.displayName = "Grid";
