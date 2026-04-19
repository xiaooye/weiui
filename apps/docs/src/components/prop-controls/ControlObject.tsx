"use client";
import { useId, useState, useEffect } from "react";
import { Textarea } from "@weiui/react";

export interface ControlObjectProps {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  description?: string;
}

export function ControlObject({ label, value, onChange, description }: ControlObjectProps) {
  const id = useId();
  const [draft, setDraft] = useState(() => safeStringify(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(safeStringify(value));
  }, [value]);

  return (
    <div className="wui-field">
      <label htmlFor={id} className="wui-label">
        {label}
      </label>
      {description && <p className="wui-field__description">{description}</p>}
      <Textarea
        id={id}
        value={draft}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setDraft(next);
          if (next.trim() === "") {
            setError(null);
            onChange(undefined);
            return;
          }
          try {
            const parsed = JSON.parse(next) as unknown;
            setError(null);
            onChange(parsed);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
          }
        }}
        rows={4}
      />
      {error && <p className="wui-field__error">{error}</p>}
    </div>
  );
}

function safeStringify(v: unknown): string {
  if (v === undefined) return "";
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return "";
  }
}
