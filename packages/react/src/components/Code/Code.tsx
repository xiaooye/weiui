import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  /** When false, renders as a block `<pre><code>`. @default true */
  inline?: boolean;
}

export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ inline = true, className, ...props }, ref) => {
    if (inline) {
      return (
        <code
          ref={ref}
          className={cn("wui-code", className)}
          {...props}
        />
      );
    }
    return (
      <pre className={cn("wui-code-block", className)}>
        <code ref={ref} {...props} />
      </pre>
    );
  },
);
Code.displayName = "Code";
