import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Menu = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/>
    </Icon>
  ),
);
Menu.displayName = "Menu";
