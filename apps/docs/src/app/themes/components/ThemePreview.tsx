"use client";
import type { ThemeResult } from "../lib/theme-generator";

interface Props {
  theme: ThemeResult;
}

export function ThemePreview({ theme }: Props) {
  // Apply theme colors as CSS variables on the preview container
  const style = {
    "--wui-color-primary": theme.colors.primary,
    "--wui-color-primary-foreground": theme.colors.primaryForeground,
    "--wui-color-ring": theme.colors.ring,
  } as React.CSSProperties;

  return (
    <div style={style}>
      <div className="wui-card">
        <div className="wui-card__header">
          <span style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)" }}>Preview</span>
        </div>
        <div className="wui-card__content" style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-6)" }}>

          {/* Buttons */}
          <div>
            <h3 style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)", marginBottom: "var(--wui-spacing-3)" }}>Buttons</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--wui-spacing-3)" }}>
              <button className="wui-button wui-button--solid">Solid</button>
              <button className="wui-button wui-button--outline">Outline</button>
              <button className="wui-button wui-button--ghost">Ghost</button>
              <button className="wui-button wui-button--soft">Soft</button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)", marginBottom: "var(--wui-spacing-3)" }}>Badges</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--wui-spacing-2)" }}>
              <span className="wui-badge wui-badge--solid">Solid</span>
              <span className="wui-badge wui-badge--soft">Soft</span>
              <span className="wui-badge wui-badge--outline">Outline</span>
            </div>
          </div>

          {/* Input */}
          <div>
            <h3 style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)", marginBottom: "var(--wui-spacing-3)" }}>Input</h3>
            <input className="wui-input" placeholder="Type something..." style={{ maxWidth: "300px" }} />
          </div>

          {/* Card */}
          <div>
            <h3 style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)", marginBottom: "var(--wui-spacing-3)" }}>Card</h3>
            <div className="wui-card" style={{ maxWidth: "300px" }}>
              <div className="wui-card__header"><strong>Card Title</strong></div>
              <div className="wui-card__content"><p style={{ fontSize: "var(--wui-font-size-sm)", color: "var(--wui-color-muted-foreground)" }}>Card content with custom theme.</p></div>
              <div className="wui-card__footer"><button className="wui-button wui-button--solid wui-button--sm">Action</button></div>
            </div>
          </div>

          {/* Avatar */}
          <div>
            <h3 style={{ fontSize: "var(--wui-font-size-sm)", fontWeight: "var(--wui-font-weight-semibold)", marginBottom: "var(--wui-spacing-3)" }}>Avatar</h3>
            <div style={{ display: "flex", gap: "var(--wui-spacing-2)" }}>
              <span className="wui-avatar wui-avatar--sm"><span className="wui-avatar__fallback">S</span></span>
              <span className="wui-avatar"><span className="wui-avatar__fallback">M</span></span>
              <span className="wui-avatar wui-avatar--lg"><span className="wui-avatar__fallback">L</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
