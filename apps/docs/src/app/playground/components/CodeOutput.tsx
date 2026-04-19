"use client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Text,
  toast,
} from "@weiui/react";
import { generateCode, type CodeGenOptions } from "../lib/generate-code";

interface Props {
  componentName: string;
  importPath: string;
  subpathImport: string | null;
  props: Record<string, unknown>;
  options?: CodeGenOptions;
}

const DEFAULT_OPTIONS: CodeGenOptions = {
  target: "jsx",
  includeImports: true,
};

export function CodeOutput({
  componentName,
  importPath,
  subpathImport,
  props,
  options,
}: Props) {
  const code = generateCode(
    { component: componentName, props, importPath, subpathImport },
    options ?? DEFAULT_OPTIONS,
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <Stack direction="row" gap={3} className="wui-tool-code__header">
          <Text as="span" size="sm" weight="medium">
            Code
          </Text>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            Copy
          </Button>
        </Stack>
      </CardHeader>
      <CardContent>
        <pre className="wui-tool-code__pre">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
