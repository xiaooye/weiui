"use client";
import { useId } from "react";
import { Textarea } from "@weiui/react";

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
    <div className="wui-field">
      <label htmlFor={id} className="wui-label">
        {label}
      </label>
      {description && <p className="wui-field__description">{description}</p>}
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
