"use client";

interface Props {
  hue: number;
  saturation: number;
  onHueChange: (hue: number) => void;
  onSaturationChange: (sat: number) => void;
}

export function ColorPicker({ hue, saturation, onHueChange, onSaturationChange }: Props) {
  return (
    <div className="wui-card">
      <div className="wui-card__header">
        <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)" }}>Primary Color</span>
      </div>
      <div className="wui-card__content" style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-4)" }}>
        {/* Color preview swatch */}
        <div style={{
          width: "100%",
          height: "60px",
          borderRadius: "var(--wui-shape-radius-md)",
          backgroundColor: `oklch(0.546 ${saturation.toFixed(3)} ${hue})`,
        }} />

        {/* Hue slider */}
        <div>
          <label style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-medium)", display: "block", marginBottom: "var(--wui-spacing-1)" }}>
            Hue: {Math.round(hue)}
          </label>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={hue}
            onChange={(e) => onHueChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: `oklch(0.546 ${saturation.toFixed(3)} ${hue})` }}
          />
        </div>

        {/* Saturation slider */}
        <div>
          <label style={{ fontSize: "var(--wui-font-size-xs)", fontWeight: "var(--wui-font-weight-medium)", display: "block", marginBottom: "var(--wui-spacing-1)" }}>
            Chroma: {saturation.toFixed(3)}
          </label>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.005}
            value={saturation}
            onChange={(e) => onSaturationChange(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
