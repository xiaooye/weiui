"use client";

import { useState } from "react";

interface ColorSwatchProps {
  name: string;
  cssVar: string;
}

export function ColorSwatch({ name, cssVar }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`var(${cssVar})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className="wui-color-swatch"
      aria-label={`Copy var(${cssVar})`}
    >
      <span
        className="wui-color-swatch__chip"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="wui-color-swatch__body">
        <span className="wui-color-swatch__name">{name}</span>
        <code className="wui-color-swatch__var">{copied ? "copied!" : `var(${cssVar})`}</code>
      </span>
    </button>
  );
}
