"use client";

import { usePathname } from "next/navigation";
import { Button } from "@weiui/react";
import { siteConfig } from "../../lib/site-config";

export function EditOnGitHub() {
  const pathname = usePathname();
  const relative =
    pathname === "/"
      ? "apps/docs/src/app/page.tsx"
      : `apps/docs/src/app${pathname}/page.mdx`;
  const url = `${siteConfig.githubUrl}/edit/main/${relative}`;
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="wui-docs-edit-link"
      endIcon={<span aria-hidden="true">{"\u2197"}</span>}
    >
      <a href={url} target="_blank" rel="noreferrer">
        Edit on GitHub
      </a>
    </Button>
  );
}
