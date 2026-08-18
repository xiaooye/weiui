"use client";
import { useId } from "react";
import { Input } from "civaria";

export interface ControlStringProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
}

export function ControlString({ label, value, onChange, description, placeholder }: ControlStringProps) {
  const id = useId();
  return (
    <div className="civ-field">
      <label htmlFor={id} className="civ-label">
        {label}
      </label>
      {description && <p className="civ-field__description">{description}</p>}
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
