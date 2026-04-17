"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "../../lib/site-config";

export function EditOnGitHub() {
  const pathname = usePathname();
  const relative =
    pathname === "/"
      ? "apps/docs/src/app/page.tsx"
      : `apps/docs/src/app${pathname}/page.mdx`;
  const url = `${siteConfig.githubUrl}/edit/main/${relative}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="wui-docs-edit-link"
    >
      Edit on GitHub →
    </a>
  );
}
