"use client";
import { useEffect, useRef } from "react";

export interface RulersProps {
  enabled: boolean;
  stageRef: React.RefObject<HTMLDivElement | null>;
}

export function Rulers({ enabled, stageRef }: RulersProps) {
  const topRef = useRef<HTMLCanvasElement>(null);
  const leftRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const stage = stageRef.current;
    const top = topRef.current;
    const left = leftRef.current;
    if (!stage || !top || !left) return;
    const draw = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      top.width = w;
      top.height = 20;
      left.width = 20;
      left.height = h;
      const ctx1 = top.getContext("2d");
      const ctx2 = left.getContext("2d");
      if (!ctx1 || !ctx2) return;
      // Use a hard-coded muted color — CSS variables don't interpolate inside
      // canvas 2D fillStyle. This is fine for the rulers layer because it's a
      // debug overlay, not themed chrome.
      const color =
        getComputedStyle(stage)
          .getPropertyValue("--wui-color-muted-foreground")
          .trim() || "#888";
      ctx1.fillStyle = color;
      ctx2.fillStyle = color;
      for (let x = 0; x < w; x += 10) {
        const tall = x % 50 === 0;
        ctx1.fillRect(x, tall ? 6 : 12, 1, tall ? 14 : 8);
      }
      for (let y = 0; y < h; y += 10) {
        const tall = y % 50 === 0;
        ctx2.fillRect(tall ? 6 : 12, y, tall ? 14 : 8, 1);
      }
    };
    draw();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(draw);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [enabled, stageRef]);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={topRef}
        className="wui-composer__ruler wui-composer__ruler--top"
        aria-hidden="true"
      />
      <canvas
        ref={leftRef}
        className="wui-composer__ruler wui-composer__ruler--left"
        aria-hidden="true"
      />
    </>
  );
}
