"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerClose,
} from "civaria";

export function DrawerDemo() {
  return (
    <Drawer side="right">
      <DrawerTrigger className="civ-button civ-button--solid">
        Open Drawer
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <h3 style={{ margin: 0, fontSize: "var(--civ-font-size-lg)" }}>
            Navigation
          </h3>
        </DrawerHeader>
        <div style={{ padding: "var(--civ-spacing-4)" }}>
          <p style={{ color: "var(--civ-color-muted-foreground)" }}>
            Drawer content slides in from the right.
          </p>
        </div>
        <DrawerFooter>
          <DrawerClose className="civ-button civ-button--outline">
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
