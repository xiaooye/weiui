"use client";
import { forwardRef, useState, useRef, type MouseEvent } from "react";
import { cn } from "../../utils/cn";

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  swatches?: string[];
  disabled?: boolean;
  className?: string;
  label?: string;
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
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue);
    const value = controlled ?? internal;
    const svRef = useRef<HTMLDivElement>(null);

    const setValue = (color: string) => {
      if (disabled) return;
      if (controlled === undefined) setInternal(color);
      onChange?.(color);
    };

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

    return (
      <div
        ref={ref}
        className={cn("wui-color-picker", className)}
        role="group"
        aria-label={label || "Color picker"}
      >
        <div
          className="wui-color-picker__preview"
          style={{ backgroundColor: value }}
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
        <input
          type="text"
          className="wui-color-picker__input"
          value={value}
          disabled={disabled}
          aria-label="Hex color"
          onChange={(e) => {
            const v = e.target.value;
            // Accept hex in-progress OR a full oklch() string.
            if (/^#[0-9a-fA-F]{0,6}$/.test(v) || isOklch(v)) setValue(v);
          }}
        />
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
