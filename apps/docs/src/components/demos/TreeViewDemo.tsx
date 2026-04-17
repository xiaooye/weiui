"use client";

import { useState } from "react";
import { TreeView, type TreeNode } from "@weiui/react";

const NODES: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "src/components",
        label: "components",
        children: [
          { id: "src/components/Button.tsx", label: "Button.tsx" },
          { id: "src/components/Input.tsx", label: "Input.tsx" },
          { id: "src/components/Card.tsx", label: "Card.tsx" },
        ],
      },
      {
        id: "src/hooks",
        label: "hooks",
        children: [
          { id: "src/hooks/use-dialog.ts", label: "use-dialog.ts" },
          { id: "src/hooks/use-id.ts", label: "use-id.ts" },
        ],
      },
      { id: "src/index.ts", label: "index.ts" },
    ],
  },
  { id: "package.json", label: "package.json" },
  { id: "README.md", label: "README.md" },
];

export function TreeViewDemo() {
  const [selected, setSelected] = useState<string>("src/index.ts");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)", width: "100%", maxWidth: "320px" }}>
      <TreeView
        nodes={NODES}
        defaultExpanded={["src", "src/components"]}
        selected={selected}
        onSelect={setSelected}
      />
      <p
        style={{
          margin: 0,
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        Selected: <code style={{ color: "var(--wui-color-foreground)" }}>{selected}</code>
      </p>
    </div>
  );
}
