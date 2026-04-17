"use client";
import Link from "next/link";
import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader } from "@weiui/react";
import { Sidebar } from "./Sidebar";
import { siteConfig } from "../../lib/site-config";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button
        type="button"
        className="wui-docs-header__menu"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <Drawer open={open} onOpenChange={setOpen} side="left">
        <DrawerContent aria-label="Navigation" className="wui-docs-mobile-nav">
          <DrawerHeader>
            <span className="wui-docs-mobile-nav__title">Navigation</span>
            <button
              type="button"
              className="wui-docs-mobile-nav__close"
              aria-label="Close navigation"
              onClick={close}
            >
              <span aria-hidden="true">×</span>
            </button>
          </DrawerHeader>
          <div
            className="wui-docs-mobile-nav__body"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) close();
            }}
          >
            <nav className="wui-docs-mobile-nav__primary" aria-label="Primary">
              {siteConfig.primaryNav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <Sidebar />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
