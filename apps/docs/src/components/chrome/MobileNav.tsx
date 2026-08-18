"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  Heading,
  Stack,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "civaria";
import { Sidebar } from "./Sidebar";
import { siteConfig } from "../../lib/site-config";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Open navigation"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="civ-docs-app-bar__menu"
          >
            <span aria-hidden="true">{"\u2630"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Menu</TooltipContent>
      </Tooltip>
      <Drawer open={open} onOpenChange={setOpen} side="left">
        <DrawerContent aria-label="Navigation" className="civ-docs-mobile-nav">
          <DrawerHeader>
            <Heading level={2} className="civ-docs-mobile-nav__title">
              Navigation
            </Heading>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="Close navigation"
              onClick={close}
            >
              <span aria-hidden="true">{"\u00D7"}</span>
            </Button>
          </DrawerHeader>
          <div
            className="civ-docs-mobile-nav__body"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) close();
            }}
          >
            <Stack direction="column" gap={1} className="civ-docs-mobile-nav__primary">
              {siteConfig.primaryNav.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </Stack>
            <Sidebar />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
