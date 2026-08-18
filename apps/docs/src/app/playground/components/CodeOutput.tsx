"use client";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  toast,
} from "@weiui/react";
import { getComponentMetadata } from "@weiui/core/registry";
import {
  generateWeiRuntimeCode,
  type WeiTarget,
} from "../../composer/lib/wei-ast";
import type { ComponentSchema } from "../../../lib/component-schema-loader";

interface Props {
  schema: ComponentSchema;
  props: Record<string, unknown>;
}

const LABEL: Record<WeiTarget, string> = {
  react: "React",
  vue: "Vue",
  solid: "Solid",
  svelte: "Svelte",
  elements: "HTML / Elements",
};

export function CodeOutput({ schema, props }: Props) {
  const [runtime, setRuntime] = useState<WeiTarget>("react");
  const metadata = getComponentMetadata(schema.name);
  const tree = useMemo(
    () => [
      {
        id: "playground-example",
        type: schema.name,
        props,
        children: [],
        text: "",
      },
    ],
    [schema.name, props],
  );
  const code = useMemo(
    () => generateWeiRuntimeCode(tree, runtime),
    [tree, runtime],
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
          <Stack direction="column" gap={1}>
            <Text as="span" size="sm" weight="medium">
              Code
            </Text>
            <Text as="span" size="xs" color="muted">
              Same WeiUI component metadata, native runtime syntax.
            </Text>
          </Stack>
          <ToggleGroup
            type="single"
            size="sm"
            value={runtime}
            onChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              if (next && next in LABEL) setRuntime(next as WeiTarget);
            }}
            label="Integration runtime"
          >
            {(Object.keys(LABEL) as WeiTarget[]).map((target) => (
              <ToggleGroupItem
                key={target}
                value={target}
                disabled={metadata?.frameworks[target] === false}
              >
                {LABEL[target]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
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
