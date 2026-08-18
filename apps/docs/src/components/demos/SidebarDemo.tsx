"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
} from "civaria";

const items = [
  { id: "dashboard", label: "Dashboard" },
  { id: "settings", label: "Settings" },
  { id: "users", label: "Users" },
];

export function SidebarDemo() {
  const [current, setCurrent] = useState("dashboard");

  return (
    <div
      style={{
        display: "flex",
        height: "260px",
        border: "1px solid var(--civ-color-border)",
        borderRadius: "var(--civ-shape-radius-lg)",
        overflow: "hidden",
      }}
    >
      <Sidebar
        aria-label="Main navigation"
        style={{ position: "relative", height: "100%", width: "14rem" }}
      >
        <SidebarHeader>
          <strong>App</strong>
        </SidebarHeader>
        <SidebarContent>
          {items.map((item) => (
            <SidebarItem
              key={item.id}
              active={current === item.id}
              onClick={() => setCurrent(item.id)}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarContent>
        <SidebarFooter
          style={{
            fontSize: "var(--civ-font-size-xs)",
            color: "var(--civ-color-muted-foreground)",
          }}
        >
          v1.0.0
        </SidebarFooter>
      </Sidebar>
      <div
        style={{
          flex: 1,
          padding: "var(--civ-spacing-4)",
          fontSize: "var(--civ-font-size-sm)",
        }}
      >
        Showing <strong>{current}</strong>
      </div>
    </div>
  );
}
