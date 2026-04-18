"use client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@weiui/react";

interface Props {
  code: string;
  codeMode: "jsx" | "html";
  onCodeModeChange: (mode: "jsx" | "html") => void;
}

export function CodeExport({ code, codeMode, onCodeModeChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <Stack direction="row" gap={3} className="wui-tool-code__header">
          <ToggleGroup
            type="single"
            value={codeMode}
            onChange={(v) => {
              const next = Array.isArray(v) ? v[0] : v;
              if (next) onCodeModeChange(next as "jsx" | "html");
            }}
            label="Output format"
          >
            <ToggleGroupItem value="jsx">JSX</ToggleGroupItem>
            <ToggleGroupItem value="html">HTML</ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(code)}
          >
            Copy
          </Button>
        </Stack>
      </CardHeader>
      <CardContent>
        <pre className="wui-tool-code__pre">
          <code>{code || "// Add components to see generated code"}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
