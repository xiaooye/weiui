"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar as WeiUISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
} from "@weiui/react";
import { siteConfig } from "../../lib/site-config";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <WeiUISidebar
      aria-label="Docs navigation"
      className="wui-docs-sidebar"
      defaultOpen={false}
    >
      <SidebarContent>
        {siteConfig.sidebarGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <SidebarItem key={item.href} asChild active={active}>
                  <Link href={item.href}>{item.label}</Link>
                </SidebarItem>
              );
            })}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </WeiUISidebar>
  );
}
