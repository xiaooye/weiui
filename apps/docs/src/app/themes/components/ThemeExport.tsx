"use client";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "civaria";
import type { ThemeResult } from "../lib/theme-generator";

interface Props {
  theme: ThemeResult;
}

export function ThemeExport({ theme }: Props) {
  const [format, setFormat] = useState<"css" | "json">("css");

  const output = format === "css" ? theme.css : JSON.stringify(theme.colors, null, 2);

  return (
    <Card>
      <CardHeader>
        <Stack direction="row" gap={3} className="civ-tool-code__header">
          <ToggleGroup
            type="single"
            value={format}
            onChange={(v) => {
              const next = Array.isArray(v) ? v[0] : v;
              if (next) setFormat(next as "css" | "json");
            }}
            label="Export format"
          >
            <ToggleGroupItem value="css">CSS</ToggleGroupItem>
            <ToggleGroupItem value="json">JSON</ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(output)}
          >
            Copy
          </Button>
        </Stack>
      </CardHeader>
      <CardContent>
        <pre className="civ-tool-code__pre civ-tool-code__pre--xs">
          <code>{output}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
