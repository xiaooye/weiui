"use client";
import { useId } from "react";
import { Textarea } from "civaria";

export interface ControlReactNodeProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
}

export function ControlReactNode({
  label,
  value,
  onChange,
  description,
  placeholder,
}: ControlReactNodeProps) {
  const id = useId();
  return (
    <div className="civ-field">
      <label htmlFor={id} className="civ-label">
        {label}
      </label>
      {description && <p className="civ-field__description">{description}</p>}
      <Textarea
        id={id}
        value={value}
        rows={3}
        placeholder={placeholder ?? "JSX or plain text"}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
}
