import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const VolumeX = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" x2="17" y1="9" y2="15"/><line x1="17" x2="23" y1="9" y2="15"/>
    </Icon>
  ),
);
VolumeX.displayName = "VolumeX";
