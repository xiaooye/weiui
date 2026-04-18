import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Volume2 = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    </Icon>
  ),
);
Volume2.displayName = "Volume2";
