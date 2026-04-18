import { forwardRef } from "react";
import { Icon, type IconProps } from "../Icon";

export const Paperclip = forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </Icon>
  ),
);
Paperclip.displayName = "Paperclip";
