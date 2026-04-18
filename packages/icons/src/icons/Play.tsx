import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Play = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <polygon points="5 3 19 12 5 21 5 3"/>
    </Icon>
  ),
);
Play.displayName = "Play";
