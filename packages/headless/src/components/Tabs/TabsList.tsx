"use client";
import { type ReactNode, type HTMLAttributes, type KeyboardEvent, useCallback, useRef } from "react";

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Layout orientation. `vertical` uses ArrowUp/ArrowDown; `horizontal` uses ArrowLeft/ArrowRight. */
  orientation?: "horizontal" | "vertical";
  /** When true, arrow navigation loops at ends (default true). */
  loop?: boolean;
}

export function TabsList({
  children,
  orientation = "horizontal",
  loop = true,
  onKeyDown,
  ...props
}: TabsListProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      const isHorizontal = orientation === "horizontal";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

      if (e.key !== nextKey && e.key !== prevKey && e.key !== "Home" && e.key !== "End") return;

      const list = ref.current;
      if (!list) return;
      const triggers = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
      );
      if (triggers.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const currentIdx = triggers.findIndex((t) => t === active);

      let nextIdx = currentIdx;
      if (e.key === nextKey) {
        nextIdx = currentIdx + 1;
        if (nextIdx >= triggers.length) nextIdx = loop ? 0 : triggers.length - 1;
      } else if (e.key === prevKey) {
        nextIdx = currentIdx - 1;
        if (nextIdx < 0) nextIdx = loop ? triggers.length - 1 : 0;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = triggers.length - 1;
      }

      if (nextIdx !== currentIdx && triggers[nextIdx]) {
        e.preventDefault();
        triggers[nextIdx]!.focus();
        triggers[nextIdx]!.click();
      }
    },
    [orientation, loop, onKeyDown],
  );

  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}
