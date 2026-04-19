"use client";
import { useId } from "react";
import { Switch } from "@weiui/react";

export interface ControlBoolProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

export function ControlBool({ label, value, onChange, description }: ControlBoolProps) {
  const id = useId();
  return (
    <div className="wui-field">
      <label htmlFor={id} className="wui-label">
        {label}
      </label>
      {description && <p className="wui-field__description">{description}</p>}
      <Switch
        id={id}
        checked={value}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
    </div>
  );
}
