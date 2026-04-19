"use client";
import { useId } from "react";

export interface ControlEnumProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  description?: string;
}

export function ControlEnum({ label, value, options, onChange, description }: ControlEnumProps) {
  const id = useId();
  return (
    <div className="wui-field">
      <label htmlFor={id} className="wui-label">
        {label}
      </label>
      {description && <p className="wui-field__description">{description}</p>}
      <select
        id={id}
        className="wui-input"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
