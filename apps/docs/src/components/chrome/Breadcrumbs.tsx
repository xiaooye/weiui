"use client";

import NextLink from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Link,
} from "@weiui/react";

const MAX_VISIBLE = 4;

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;

  interface Crumb {
    href: string;
    label: string;
    active: boolean;
  }

  const crumbs: Crumb[] = [
    { href: "/", label: "Home", active: false },
    ...segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const isLast = idx === segments.length - 1;
      const label = seg.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
      return { href, label, active: isLast };
    }),
  ];

  const truncate = crumbs.length > MAX_VISIBLE;
  const visibleCrumbs: Array<Crumb | "ellipsis"> = truncate
    ? [
        crumbs[0]!,
        "ellipsis",
        ...crumbs.slice(crumbs.length - (MAX_VISIBLE - 2)),
      ]
    : crumbs;

  return (
    <Breadcrumb className="wui-docs-breadcrumbs">
      {visibleCrumbs.map((item, idx) => {
        const isLast = idx === visibleCrumbs.length - 1;
        if (item === "ellipsis") {
          return (
            <Fragment key="ellipsis">
              <BreadcrumbEllipsis />
              {!isLast && <BreadcrumbSeparator>{"\u203A"}</BreadcrumbSeparator>}
            </Fragment>
          );
        }
        return (
          <Fragment key={item.href}>
            <BreadcrumbItem active={item.active}>
              {item.active ? (
                item.label
              ) : (
                <Link asChild underline="hover">
                  <NextLink href={item.href}>{item.label}</NextLink>
                </Link>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator>{"\u203A"}</BreadcrumbSeparator>}
          </Fragment>
        );
      })}
    </Breadcrumb>
  );
}
