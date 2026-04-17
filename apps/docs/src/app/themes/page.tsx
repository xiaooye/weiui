"use client";
import { useState, useMemo } from "react";
import { Header } from "../../components/chrome/Header";
import { generateTheme } from "./lib/theme-generator";
import { ColorPicker } from "./components/ColorPicker";
import { ThemePreview } from "./components/ThemePreview";
import { ThemeExport } from "./components/ThemeExport";

export default function ThemesPage() {
  const [hue, setHue] = useState(263); // Default: WeiUI blue
  const [saturation, setSaturation] = useState(0.245);

  const theme = useMemo(() => generateTheme(hue, saturation), [hue, saturation]);

  return (
    <>
      <Header />
      <main className="wui-tool-shell">
        <header className="wui-tool-shell__header">
          <h1 className="wui-tool-shell__title">Theme Builder</h1>
          <p className="wui-tool-shell__sub">
            Pick a primary color and preview how every component looks with your custom theme. Export as CSS variables or JSON tokens.
          </p>
        </header>

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
      </main>
    </>
  );
}
