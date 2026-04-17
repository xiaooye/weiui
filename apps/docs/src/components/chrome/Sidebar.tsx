"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "../../lib/site-config";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="wui-docs-sidebar" aria-label="Docs navigation">
      {siteConfig.sidebarGroups.map((group) => (
        <div key={group.title} className="wui-docs-sidebar__group">
          <h4 className="wui-docs-sidebar__title">{group.title}</h4>
          <ul className="wui-docs-sidebar__list">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="wui-docs-sidebar__link"
                    aria-current={active ? "page" : undefined}
                    data-active={active || undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
