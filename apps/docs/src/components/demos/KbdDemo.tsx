"use client";

import { Kbd } from "@weiui/react";

export function KbdDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
        fontSize: "var(--wui-font-size-base)",
      }}
    >
      <div>
        Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open the command palette.
      </div>
      <div>
        Submit without closing: <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd>
      </div>
      <div>
        Escape a dialog: <Kbd>Esc</Kbd>
      </div>
    </div>
  );
}
