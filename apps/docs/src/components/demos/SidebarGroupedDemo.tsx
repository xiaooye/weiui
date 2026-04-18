"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSubMenu,
} from "@weiui/react";

export function SidebarGroupedDemo() {
  const [active, setActive] = useState("dashboard");

  return (
    <div
      style={{
        display: "flex",
        height: 360,
        border: "1px solid var(--wui-color-border)",
        borderRadius: "var(--wui-shape-radius-lg)",
        overflow: "hidden",
      }}
    >
      <Sidebar
        aria-label="Admin navigation"
        style={{ position: "relative", height: "100%", width: "15rem" }}
      >
        <SidebarHeader>
          <strong>Admin</strong>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <SidebarItem active={active === "dashboard"} onClick={() => setActive("dashboard")}>
              Dashboard
            </SidebarItem>
            <SidebarItem active={active === "reports"} onClick={() => setActive("reports")}>
              Reports
            </SidebarItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>People</SidebarGroupLabel>
            <SidebarItem active={active === "users"} onClick={() => setActive("users")}>
              Users
            </SidebarItem>
            <SidebarSubMenu label="Teams">
              <SidebarItem active={active === "team-eng"} onClick={() => setActive("team-eng")}>
                Engineering
              </SidebarItem>
              <SidebarItem active={active === "team-design"} onClick={() => setActive("team-design")}>
                Design
              </SidebarItem>
              <SidebarItem active={active === "team-ops"} onClick={() => setActive("team-ops")}>
                Operations
              </SidebarItem>
            </SidebarSubMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarItem active={active === "settings"} onClick={() => setActive("settings")}>
              Settings
            </SidebarItem>
            <SidebarItem active={active === "audit"} onClick={() => setActive("audit")}>
              Audit log
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div style={{ flex: 1, padding: "var(--wui-spacing-4)", fontSize: "var(--wui-font-size-sm)" }}>
        Showing <strong>{active}</strong>
      </div>
    </div>
  );
}
