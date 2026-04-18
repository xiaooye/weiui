"use client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Text,
} from "@weiui/react";
import type { ComponentDef } from "../lib/component-registry";

interface Props {
  component: ComponentDef;
  propValues: Record<string, string | boolean>;
  children: string;
}

export function CodeOutput({ component, propValues, children }: Props) {
  const code = generateCode(component, propValues, children);

  return (
    <Card>
      <CardHeader>
        <Stack direction="row" gap={3} className="wui-tool-code__header">
          <Text as="span" size="sm" weight="medium">
            Code
          </Text>
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
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function generateCode(
  component: ComponentDef,
  propValues: Record<string, string | boolean>,
  children: string,
): string {
  const props = component.props
    .filter((p) => propValues[p.name] !== p.defaultValue)
    .map((p) => {
      const val = propValues[p.name];
      if (typeof val === "boolean") return val ? p.name : "";
      return `${p.name}="${val}"`;
    })
    .filter(Boolean)
    .join(" ");

  const propsStr = props ? ` ${props}` : "";

  if (!children) {
    return `<${component.name}${propsStr} />`;
  }
  return `<${component.name}${propsStr}>${children}</${component.name}>`;
}
