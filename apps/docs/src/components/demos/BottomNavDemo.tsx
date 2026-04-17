"use client";

import { useState } from "react";
import { BottomNav, BottomNavItem } from "@weiui/react";

const ITEMS = [
  { id: "home", label: "Home", icon: "\u{1F3E0}" },
  { id: "search", label: "Search", icon: "\u{1F50D}" },
  { id: "alerts", label: "Alerts", icon: "\u{1F514}" },
  { id: "profile", label: "Profile", icon: "\u{1F464}" },
];

export function BottomNavDemo() {
  const [active, setActive] = useState("home");

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
        minHeight: "120px",
        padding: "var(--wui-spacing-4)",
        borderRadius: "var(--wui-shape-radius-lg)",
        border: "1px solid var(--wui-color-border)",
        background: "var(--wui-color-muted)",
        overflow: "hidden",
      }}
    >
      <p
        style={{
          margin: 0,
          marginBlockEnd: "var(--wui-spacing-2)",
          fontSize: "var(--wui-font-size-sm)",
          color: "var(--wui-color-muted-foreground)",
        }}
      >
        Active: <strong style={{ color: "var(--wui-color-foreground)" }}>{ITEMS.find((i) => i.id === active)?.label}</strong>
      </p>
      <div style={{ position: "absolute", insetInline: 0, insetBlockEnd: 0 }}>
        <BottomNav style={{ position: "static" }}>
          {ITEMS.map((item) => (
            <BottomNavItem
              key={item.id}
              active={active === item.id}
              icon={item.icon}
              label={item.label}
              onClick={() => setActive(item.id)}
            />
          ))}
        </BottomNav>
      </div>
    </div>
  );
}
