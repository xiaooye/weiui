"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig, type SidebarItem } from "../../lib/site-config";

export function DocsPager() {
  const pathname = usePathname();
  const allItems: readonly SidebarItem[] = siteConfig.sidebarGroups.flatMap(
    (g) => g.items as readonly SidebarItem[],
  );
  const idx = allItems.findIndex((item) => item.href === pathname);
  if (idx === -1) return null;
  const prev = allItems[idx - 1];
  const next = allItems[idx + 1];

  return (
    <nav className="wui-docs-pager" aria-label="Pager">
      {prev ? (
        <Link href={prev.href} className="wui-docs-pager__prev">
          <span className="wui-docs-pager__direction">← Previous</span>
          <span className="wui-docs-pager__label">{prev.label}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link href={next.href} className="wui-docs-pager__next">
          <span className="wui-docs-pager__direction">Next →</span>
          <span className="wui-docs-pager__label">{next.label}</span>
        </Link>
      ) : <span />}
    </nav>
  );
}
