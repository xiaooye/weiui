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
import type { ComponentSchema } from "../../../lib/component-schema-loader";

interface Props {
  schema: ComponentSchema;
  props: Record<string, unknown>;
  options?: CodeGenOptions;
}

const DEFAULT_OPTIONS: CodeGenOptions = {
  target: "jsx",
  includeImports: true,
};

export function CodeOutput({ schema, props, options }: Props) {
  const code = generateCode(
    {
      component: schema.name,
      props,
      importPath: schema.importPath,
      subpathImport: schema.subpathImport,
    },
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
