"use client";
import { useId } from "react";

export interface ControlColorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function ControlColor({ label, value, onChange, description }: ControlColorProps) {
  const id = useId();
  return (
    <div className="wui-field">
      <label htmlFor={id} className="wui-label">
        {label}
      </label>
      {description && <p className="wui-field__description">{description}</p>}
      <input
        id={id}
        type="color"
        className="wui-input"
        value={value || "#000000"}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
}
