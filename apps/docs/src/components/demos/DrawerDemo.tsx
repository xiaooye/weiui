"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerClose,
} from "@weiui/react";

export function DrawerDemo() {
  return (
    <Drawer side="right">
      <DrawerTrigger className="wui-button wui-button--solid">
        Open Drawer
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <h3 style={{ margin: 0, fontSize: "var(--wui-font-size-lg)" }}>
            Navigation
          </h3>
        </DrawerHeader>
        <div style={{ padding: "var(--wui-spacing-4)" }}>
          <p style={{ color: "var(--wui-color-muted-foreground)" }}>
            Drawer content slides in from the right.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose className="wui-button wui-button--outline">
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
