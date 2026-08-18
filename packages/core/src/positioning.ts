export type Placement = "top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "left" | "right";

export interface RectLike { x: number; y: number; width: number; height: number; }
export interface SizeLike { width: number; height: number; }
export interface PositioningOptions {
  placement?: Placement;
  offset?: number;
  viewport?: SizeLike;
  padding?: number;
}
export interface FloatingPosition { x: number; y: number; placement: Placement; }

function alignX(anchor: RectLike, floating: SizeLike, placement: Placement): number {
  if (placement.endsWith("-start")) return anchor.x;
  if (placement.endsWith("-end")) return anchor.x + anchor.width - floating.width;
  return anchor.x + (anchor.width - floating.width) / 2;
}

export function computeFloatingPosition(anchor: RectLike, floating: SizeLike, options: PositioningOptions = {}): FloatingPosition {
  const placement = options.placement ?? "bottom";
  const offset = options.offset ?? 8;
  let x = alignX(anchor, floating, placement);
  let y = anchor.y + anchor.height + offset;
  if (placement.startsWith("top")) y = anchor.y - floating.height - offset;
  if (placement === "left") { x = anchor.x - floating.width - offset; y = anchor.y + (anchor.height - floating.height) / 2; }
  if (placement === "right") { x = anchor.x + anchor.width + offset; y = anchor.y + (anchor.height - floating.height) / 2; }
  if (options.viewport) {
    const padding = options.padding ?? 8;
    x = Math.min(Math.max(x, padding), Math.max(padding, options.viewport.width - floating.width - padding));
    y = Math.min(Math.max(y, padding), Math.max(padding, options.viewport.height - floating.height - padding));
  }
  return { x, y, placement };
}
