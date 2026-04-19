"use client";
import { useMemo } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  toast,
  ToggleGroup,
  ToggleGroupItem,
} from "@weiui/react";
import { generateCode, makeSchemaResolver } from "../lib/generate-code";
import type { ComponentNode } from "../lib/tree";
import type { ComponentSchema } from "../../../lib/component-schema-loader";

export type CodeMode = "jsx" | "tsx" | "html";

interface Props {
  tree: ComponentNode[];
  schemas: ComponentSchema[];
  codeMode: CodeMode;
  onCodeModeChange: (mode: CodeMode) => void;
}

const FILE_EXT: Record<CodeMode, string> = {
  jsx: "jsx",
  tsx: "tsx",
  html: "html",
};

const MIME_TYPE: Record<CodeMode, string> = {
  jsx: "text/plain",
  tsx: "text/plain",
  html: "text/html",
};

export function CodeExport({ tree, schemas, codeMode, onCodeModeChange }: Props) {
  const resolver = useMemo(
    () =>
      makeSchemaResolver(
        schemas.map((s) => ({
          name: s.name,
          importPath: s.importPath,
          subpathImport: s.subpathImport ?? null,
        })),
      ),
    [schemas],
  );

  const code = useMemo(() => {
    if (tree.length === 0) return "";
    return generateCode(tree, resolver, {
      target: codeMode,
      componentWrap: codeMode === "tsx",
      includeImports: true,
    });
  }, [tree, resolver, codeMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: MIME_TYPE[codeMode] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `composition.${FILE_EXT[codeMode]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const emptyCode = tree.length === 0;

  return (
    <Card>
      <CardHeader>
        <Stack direction="row" gap={3} className="wui-tool-code__header">
          <ToggleGroup
            type="single"
            value={codeMode}
            onChange={(v) => {
              const next = Array.isArray(v) ? v[0] : v;
              if (next) onCodeModeChange(next as CodeMode);
            }}
            label="Output format"
          >
            <ToggleGroupItem value="jsx">JSX</ToggleGroupItem>
            <ToggleGroupItem value="tsx">TSX</ToggleGroupItem>
            <ToggleGroupItem value="html">HTML</ToggleGroupItem>
          </ToggleGroup>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={emptyCode}
          >
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={emptyCode}
          >
            Download
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
