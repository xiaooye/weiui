import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Search = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>
    </Icon>
  ),
);
Search.displayName = "Search";
