"use client";

import { Button, Tooltip, TooltipTrigger, TooltipContent, TooltipArrow } from "civaria";

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
          background: "var(--civ-color-foreground)",
          color: "var(--civ-color-background)",
          padding: "var(--civ-spacing-1) var(--civ-spacing-2)",
          borderRadius: "var(--civ-shape-radius-sm)",
          fontSize: "var(--civ-font-size-xs)",
          zIndex: 1000,
        }}
      >
        Helpful information
        <TooltipArrow />
      </TooltipContent>
    </Tooltip>
  );
}
