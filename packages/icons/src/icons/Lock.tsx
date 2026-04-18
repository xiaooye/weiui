import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Lock = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </Icon>
  ),
);
Lock.displayName = "Lock";
