"use client";
import {
  Splitter,
  SplitterPanel,
  Drawer,
  DrawerContent,
  Button,
} from "@weiui/react";
import { useEffect, useState, type ReactNode } from "react";

export interface ResizableShellProps {
  palette: ReactNode;
  canvas: ReactNode;
  props: ReactNode;
}

const LS_KEY = "wui-composer-layout-sizes";
const DEFAULT_SIZES = [17, 61, 22] as const;

function readSizes(): number[] {
  if (typeof window === "undefined") return [...DEFAULT_SIZES];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [...DEFAULT_SIZES];
    const parsed: unknown = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length === 3 &&
      parsed.every((n) => typeof n === "number")
    ) {
      return parsed as number[];
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_SIZES];
}

export function ResizableShell({
  palette,
  canvas,
  props: propsSlot,
}: ResizableShellProps) {
  const [isNarrow, setIsNarrow] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [sizes, setSizes] = useState<number[]>(() => readSizes());

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const m = window.matchMedia("(max-width: 768px)");
    setIsNarrow(m.matches);
    const cb = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(sizes));
    } catch {
      /* ok */
    }
  }, [sizes]);

  if (isNarrow) {
    return (
      <div className="wui-composer__mobile-shell">
        <div className="wui-composer__mobile-toolbar">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPaletteOpen(true)}
          >
            Components
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPropsOpen(true)}
          >
            Props
          </Button>
        </div>
        {canvas}
        <Drawer open={paletteOpen} onOpenChange={setPaletteOpen} side="left">
          <DrawerContent>{palette}</DrawerContent>
        </Drawer>
        <Drawer open={propsOpen} onOpenChange={setPropsOpen} side="right">
          <DrawerContent>{propsSlot}</DrawerContent>
        </Drawer>
      </div>
    );
  }

  return (
    <Splitter sizes={sizes} onSizesChange={setSizes}>
      <SplitterPanel minSize={14} maxSize={30} collapsible>
        {palette}
      </SplitterPanel>
      <SplitterPanel minSize={40}>{canvas}</SplitterPanel>
      <SplitterPanel minSize={16} maxSize={35} collapsible>
        {propsSlot}
      </SplitterPanel>
    </Splitter>
  );
}
