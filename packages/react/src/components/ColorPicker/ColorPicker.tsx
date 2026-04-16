"use client";
import { forwardRef, useState } from "react";
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

function hexToHue(hex: string): number {
  if (hex.length < 7) return 0;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h = 0;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round(h * 60);
}

function hueToHex(hue: number): string {
  const c = 1;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = 0;
  let r = 0,
    g = 0,
    b = 0;
  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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

    const setValue = (color: string) => {
      if (disabled) return;
      if (controlled === undefined) setInternal(color);
      onChange?.(color);
    };

    const hue = hexToHue(value);

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
        <input
          type="range"
          className="wui-color-picker__hue"
          min={0}
          max={360}
          value={hue}
          disabled={disabled}
          aria-label="Hue"
          onChange={(e) => setValue(hueToHex(Number(e.target.value)))}
        />
        <input
          type="text"
          className="wui-color-picker__input"
          value={value}
          disabled={disabled}
          aria-label="Hex color"
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setValue(v);
          }}
        />
        {swatches.length > 0 && (
          <div className="wui-color-picker__swatches" role="listbox" aria-label="Color swatches">
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
