"use client";
import { forwardRef, useState, useRef, useEffect, type MouseEvent } from "react";
import { cn } from "../../utils/cn";

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  swatches?: string[];
  disabled?: boolean;
  className?: string;
  label?: string;
  /** Adds an alpha slider and composes `rgba()` output when changed. */
  showAlpha?: boolean;
  /** Default alpha (0-1). */
  defaultAlpha?: number;
  /** Renders a segmented control to switch between hex / rgb / hsl / oklch. */
  showFormatToggle?: boolean;
  /** Controlled format. */
  format?: ColorFormat;
  /** Fires when the user changes the output format. */
  onFormatChange?: (format: ColorFormat) => void;
  /** Visual variant. `inline` renders the full picker in place (no popover wrapper). */
  variant?: "popover" | "inline";
}

/** Parse a `#RRGGBB` hex string into [h, s, v] in degrees, 0-1, 0-1. */
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return { h: 0, s: 0, v: 0 };
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  const toHex = (t: number) =>
    Math.round((t + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

function isOklch(s: string): boolean {
  return /^oklch\s*\(/i.test(s.trim());
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): [number, number, number] | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) * 60;
    else if (max === gN) h = ((bN - rN) / d + 2) * 60;
    else h = ((rN - gN) / d + 4) * 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function formatColor(hex: string, alpha: number, format: ColorFormat, withAlpha: boolean): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  const a = Math.round(alpha * 100) / 100;
  switch (format) {
    case "hex":
      return hex;
    case "rgb":
      return withAlpha ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    case "hsl": {
      const [h, s, l] = rgbToHsl(r, g, b);
      return withAlpha ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`;
    }
    case "oklch":
      // Rough conversion — a real implementation would use proper color-space math.
      return withAlpha
        ? `oklch(${(r + g + b) / 765} ${(Math.max(r, g, b) - Math.min(r, g, b)) / 255 / 3} 0 / ${a})`
        : `oklch(${(r + g + b) / 765} ${(Math.max(r, g, b) - Math.min(r, g, b)) / 255 / 3} 0)`;
  }
}

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value: controlled,
      defaultValue = "#000000",
      onChange,
      swatches = [],
      disabled,
      className,
      label,
      showAlpha,
      defaultAlpha = 1,
      showFormatToggle,
      format: controlledFormat,
      onFormatChange,
      variant = "popover",
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue);
    const value = controlled ?? internal;
    const [alpha, setAlpha] = useState(defaultAlpha);
    const [internalFormat, setInternalFormat] = useState<ColorFormat>("hex");
    const format = controlledFormat ?? internalFormat;
    const setFormat = (f: ColorFormat) => {
      if (controlledFormat === undefined) setInternalFormat(f);
      onFormatChange?.(f);
    };
    const [announcement, setAnnouncement] = useState("");
    const svRef = useRef<HTMLDivElement>(null);

    const setValue = (color: string) => {
      if (disabled) return;
      if (controlled === undefined) setInternal(color);
      onChange?.(color);
      // Announce to live region
      setAnnouncement(`Color changed to ${color}`);
    };

    useEffect(() => {
      if (announcement) {
        const timer = setTimeout(() => setAnnouncement(""), 1500);
        return () => clearTimeout(timer);
      }
    }, [announcement]);

    // Parse when we can — otherwise keep the string value but don't derive HSV.
    const hsv = isHex(value) ? hexToHsv(value) : null;
    const hue = hsv?.h ?? 0;
    const saturation = hsv?.s ?? 0;
    const brightness = hsv?.v ?? 0;
    // For the SV area backdrop, use the hue at full saturation/value.
    const hueHex = hsvToHex(hue, 1, 1);

    const updateFromPointer = (clientX: number, clientY: number) => {
      if (disabled || !svRef.current || !hsv) return;
      const rect = svRef.current.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((clientY - rect.top) / rect.height, 0, 1);
      setValue(hsvToHex(hue, x, 1 - y));
    };

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      updateFromPointer(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      if (e.buttons !== 1) return;
      updateFromPointer(e.clientX, e.clientY);
    };

    const displayOutput = isHex(value) ? formatColor(value, alpha, format, showAlpha ?? false) : value;

    return (
      <div
        ref={ref}
        className={cn(
          "wui-color-picker",
          variant === "inline" && "wui-color-picker--inline",
          className,
        )}
        role="group"
        aria-label={label || "Color picker"}
      >
        <div
          className={cn(
            "wui-color-picker__preview",
            showAlpha && "wui-color-picker__preview--checker",
          )}
          style={{ backgroundColor: value, opacity: showAlpha ? alpha : undefined }}
          aria-hidden="true"
        />
        <div
          ref={svRef}
          className="wui-color-picker__sv"
          role="slider"
          aria-label="Saturation and value"
          aria-valuetext={
            hsv
              ? `saturation ${Math.round(saturation * 100)}%, value ${Math.round(
                  brightness * 100,
                )}%`
              : undefined
          }
          aria-disabled={disabled || undefined}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          style={{
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueHex})`,
          }}
        >
          {hsv && (
            <div
              className="wui-color-picker__sv-thumb"
              style={{
                insetInlineStart: `${saturation * 100}%`,
                insetBlockStart: `${(1 - brightness) * 100}%`,
              }}
              aria-hidden="true"
            />
          )}
        </div>
        <input
          type="range"
          className="wui-color-picker__hue"
          min={0}
          max={360}
          value={hue}
          disabled={disabled}
          aria-label="Hue"
          onChange={(e) => setValue(hsvToHex(Number(e.target.value), saturation || 1, brightness || 1))}
        />
        {showAlpha && (
          <input
            type="range"
            className="wui-color-picker__alpha"
            min={0}
            max={1}
            step={0.01}
            value={alpha}
            disabled={disabled}
            aria-label="Alpha"
            onChange={(e) => {
              setAlpha(Number(e.target.value));
              if (isHex(value)) onChange?.(formatColor(value, Number(e.target.value), format, true));
            }}
          />
        )}
        {showFormatToggle && (
          <div
            className="wui-color-picker__format"
            role="radiogroup"
            aria-label="Output format"
          >
            {(["hex", "rgb", "hsl", "oklch"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className="wui-color-picker__format-btn"
                role="radio"
                aria-checked={format === f}
                data-selected={format === f || undefined}
                onClick={() => setFormat(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          className="wui-color-picker__input"
          value={displayOutput}
          disabled={disabled}
          aria-label="Color value (hex or oklch)"
          placeholder="#rrggbb or oklch(…)"
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v) || isOklch(v)) setValue(v);
          }}
        />
        <div
          aria-live="polite"
          aria-atomic="true"
          data-wui-color-picker-live
          style={{
            position: "absolute",
            inlineSize: 1,
            blockSize: 1,
            inset: 0,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {announcement}
        </div>
        {swatches.length > 0 && (
          <div
            className="wui-color-picker__swatches"
            role="listbox"
            aria-label="Color swatches"
          >
            {swatches.map((color) => (
              <button
                key={color}
                type="button"
                className="wui-color-picker__swatch"
                style={{ backgroundColor: color }}
                data-selected={color === value || undefined}
                role="option"
                aria-selected={color === value}
                aria-label={color}
                onClick={() => setValue(color)}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
ColorPicker.displayName = "ColorPicker";
