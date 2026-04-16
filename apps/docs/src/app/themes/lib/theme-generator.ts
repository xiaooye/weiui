export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
}

export interface ThemeResult {
  colors: ThemeColors;
  css: string;
  contrastResults: { pair: string; ratio: number; passes: boolean }[];
}

export function generateTheme(hue: number, saturation: number = 0.2): ThemeResult {
  const colors: ThemeColors = {
    primary: `oklch(0.546 ${saturation.toFixed(3)} ${hue})`,
    primaryForeground: "oklch(1 0 0)",
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0.010 240)",
    muted: "oklch(0.967 0.003 240)",
    mutedForeground: "oklch(0.446 0.018 240)",
    border: "oklch(0.928 0.006 240)",
    ring: `oklch(0.546 ${saturation.toFixed(3)} ${hue})`,
  };

  // Simple contrast estimation using OKLCH lightness
  // L=0 is black (luminance 0), L=1 is white (luminance 1)
  // Approximate relative luminance from OKLCH lightness: L_rel ≈ oklch_L^3
  const contrastResults = [
    checkContrast("primary/foreground", colors.primary, colors.primaryForeground),
    checkContrast("foreground/background", colors.foreground, colors.background),
    checkContrast("muted-fg/muted", colors.mutedForeground, colors.muted),
  ];

  const css = generateCss(colors);

  return { colors, css, contrastResults };
}

function checkContrast(pair: string, fg: string, bg: string): { pair: string; ratio: number; passes: boolean } {
  // Extract lightness from oklch(L C H) format
  const fgL = parseOklchLightness(fg);
  const bgL = parseOklchLightness(bg);

  // Approximate relative luminance from OKLCH lightness
  const fgLum = Math.pow(fgL, 3);
  const bgLum = Math.pow(bgL, 3);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  return { pair, ratio: Math.round(ratio * 100) / 100, passes: ratio >= 4.5 };
}

function parseOklchLightness(color: string): number {
  const match = color.match(/oklch\(([\d.]+)/);
  return match ? parseFloat(match[1] ?? "0.5") : 0.5;
}

function generateCss(colors: ThemeColors): string {
  return `:root {
  --wui-color-primary: ${colors.primary};
  --wui-color-primary-foreground: ${colors.primaryForeground};
  --wui-color-background: ${colors.background};
  --wui-color-foreground: ${colors.foreground};
  --wui-color-muted: ${colors.muted};
  --wui-color-muted-foreground: ${colors.mutedForeground};
  --wui-color-border: ${colors.border};
  --wui-color-ring: ${colors.ring};
}`;
}
