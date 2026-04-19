"use client";
import { useId } from "react";
import { Input } from "@weiui/react";

export interface ControlNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function ControlNumber({
  label,
  value,
  onChange,
  description,
  min,
  max,
  step,
}: ControlNumberProps) {
  const id = useId();
  return (
    <div className="wui-field">
      <label htmlFor={id} className="wui-label">
        {label}
      </label>
      {description && <p className="wui-field__description">{description}</p>}
      <Input
        id={id}
        type="number"
        value={Number.isFinite(value) ? String(value) : ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const raw = e.currentTarget.value;
          if (raw === "") {
            onChange(0);
            return;
          }
          const next = Number(raw);
          if (!Number.isNaN(next)) onChange(next);
        }}
      />
    </div>
  );
}
