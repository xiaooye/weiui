"use client";
import { useState, useMemo } from "react";
import { generateTheme } from "./lib/theme-generator";
import { ColorPicker } from "./components/ColorPicker";
import { ThemePreview } from "./components/ThemePreview";
import { ThemeExport } from "./components/ThemeExport";

export default function ThemesPage() {
  const [hue, setHue] = useState(263); // Default: WeiUI blue
  const [saturation, setSaturation] = useState(0.245);

  const theme = useMemo(() => generateTheme(hue, saturation), [hue, saturation]);

  return (
    <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "var(--wui-spacing-6)" }}>
      <h1 style={{ fontSize: "var(--wui-font-size-3xl)", fontWeight: "var(--wui-font-weight-bold)", marginBottom: "var(--wui-spacing-2)" }}>
        Theme Builder
      </h1>
      <p style={{ color: "var(--wui-color-muted-foreground)", marginBottom: "var(--wui-spacing-6)" }}>
        Pick a primary color and preview how all components look with your custom theme.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "var(--wui-spacing-6)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-4)" }}>
          <ColorPicker hue={hue} saturation={saturation} onHueChange={setHue} onSaturationChange={setSaturation} />

          {/* Contrast Results */}
          <div className="wui-card">
            <div className="wui-card__header">
              <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)" }}>Contrast Check</span>
            </div>
            <div className="wui-card__content" style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-2)" }}>
              {theme.contrastResults.map((r) => (
                <div key={r.pair} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--wui-font-size-sm)" }}>
                  <span>{r.pair}</span>
                  <span style={{ color: r.passes ? "var(--wui-color-success)" : "var(--wui-color-destructive)", fontWeight: "var(--wui-font-weight-medium)" }}>
                    {r.ratio}:1 {r.passes ? "PASS" : "FAIL"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <ThemeExport theme={theme} />
        </div>

        <ThemePreview theme={theme} />
      </div>
    </div>
  );
}
