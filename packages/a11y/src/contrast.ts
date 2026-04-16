// packages/a11y/src/contrast.ts
import Color from "colorjs.io";

export function getContrastRatio(fg: string, bg: string): number {
  const fgColor = new Color(fg);
  const bgColor = new Color(bg);
  const fgLum = fgColor.luminance;
  const bgLum = bgColor.luminance;
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateContrastAAA(
  fg: string,
  bg: string,
  isLargeText = false,
): { passes: boolean; ratio: number; required: number } {
  const ratio = getContrastRatio(fg, bg);
  const required = isLargeText ? 4.5 : 7.0;
  return { passes: ratio >= required, ratio, required };
}
