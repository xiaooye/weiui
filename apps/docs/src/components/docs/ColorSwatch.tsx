"use client";

import { useState } from "react";
import { Card, Code, Stack, Text } from "@weiui/react";

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
    } catch {
      /* ignored */
    }
  };
  return (
    <Card variant="outlined" asChild className="wui-color-swatch">
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy var(${cssVar})`}
      >
        <Stack direction="row" gap={3}>
          <span
            className="wui-color-swatch__chip"
            aria-hidden="true"
            style={{ backgroundColor: `var(${cssVar})` }}
          />
          <Stack direction="column" gap={0} className="wui-color-swatch__body">
            <Text as="span" size="sm" weight="medium">
              {name}
            </Text>
            <Code className="wui-color-swatch__var">
              {copied ? "copied!" : `var(${cssVar})`}
            </Code>
          </Stack>
        </Stack>
      </button>
    </Card>
  );
}
