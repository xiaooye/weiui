"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AppBar,
  AppBarActions,
  AppBarBrand,
  AppBarNav,
  Badge,
  Button,
  Divider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@weiui/react";
import { siteConfig } from "../../lib/site-config";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "./SearchTrigger";
import { MobileNav } from "./MobileNav";

function useScrolled(threshold: number) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolled(24);

  return (
    <AppBar
      color="surface"
      className="wui-docs-app-bar"
      data-scrolled={scrolled || undefined}
    >
      <AppBarBrand>
        <Link href="/" className="wui-docs-app-bar__brand">
          <span aria-hidden="true" className="wui-docs-app-bar__logo">
            {"\u25D0"}
          </span>
          <span>{siteConfig.name}</span>
          <Badge variant="soft" size="sm">
            v{siteConfig.version}
          </Badge>
        </Link>
      </AppBarBrand>
      <AppBarNav aria-label="Primary">
        {siteConfig.primaryNav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Button
              key={item.href}
              asChild
              variant={active ? "soft" : "ghost"}
              size="sm"
            >
              <Link href={item.href} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            </Button>
          );
        })}
      </AppBarNav>
      <AppBarActions>
        <SearchTrigger />
        <Divider orientation="vertical" className="wui-docs-app-bar__divider" />
        <ThemeToggle />
        <Tooltip>
          <TooltipTrigger>
            <Button
              asChild
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="GitHub"
              className="wui-docs-app-bar__github"
            >
              <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">
                <span aria-hidden="true" style={{ fontSize: "1.1em" }}>
                  {"\u25EF"}
                </span>
                <span className="wui-docs-app-bar__github-label">GitHub</span>
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open on GitHub</TooltipContent>
        </Tooltip>
        <MobileNav />
      </AppBarActions>
    </AppBar>
  );
}
