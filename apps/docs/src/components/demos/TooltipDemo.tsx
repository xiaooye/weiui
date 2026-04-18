"use client";

import { Button, Tooltip, TooltipTrigger, TooltipContent, TooltipArrow } from "@weiui/react";

export function TooltipDemo() {
  return (
    <Tooltip delay={200}>
      <TooltipTrigger>
        <Button variant="ghost">
          Hover or focus me
        </Button>
      </TooltipTrigger>
      <TooltipContent
        style={{
          background: "var(--wui-color-foreground)",
          color: "var(--wui-color-background)",
          padding: "var(--wui-spacing-1) var(--wui-spacing-2)",
          borderRadius: "var(--wui-shape-radius-sm)",
          fontSize: "var(--wui-font-size-xs)",
          zIndex: 1000,
        }}
      >
        Helpful information
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
}
