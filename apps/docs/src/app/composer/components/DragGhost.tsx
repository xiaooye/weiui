"use client";
import { Portal, Chip } from "@weiui/react";
import { useInteractionManager } from "../lib/interaction-manager";
import type { ComponentNode } from "../lib/tree";

export function DragGhost() {
  const { state } = useInteractionManager();
  const drag = state.drag;
  if (!drag) return null;

  const label =
    drag.kind === "palette"
      ? (drag.payload as ComponentNode).type
      : `${(drag.payload as string[]).length} node${(drag.payload as string[]).length === 1 ? "" : "s"}`;

  return (
    <Portal>
      <div
        aria-hidden="true"
        className="wui-composer__drag-ghost"
        style={{
          position: "fixed",
          top: drag.pointer.y + 8,
          left: drag.pointer.x + 8,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <Chip variant="filled" size="sm">
          {label}
        </Chip>
      </div>
    </Portal>
  );
}
