"use client";
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  EmptyState,
  Field,
  Input,
  Label,
  Stack,
  Text,
} from "@weiui/react";
import type { LegacyComponentNode } from "../lib/component-tree";

interface Props {
  node: LegacyComponentNode | null;
  onUpdate: (updates: Partial<LegacyComponentNode>) => void;
}

export function PropsEditor({ node, onUpdate }: Props) {
  if (!node) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            size="sm"
            title="No selection"
            description="Select a component to edit its props."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Text as="span" size="sm" weight="semibold">
          {node.type} Props
        </Text>
      </CardHeader>
      <CardContent>
        <Stack direction="column" gap={3}>
          <Field>
            <Label htmlFor={`composer-${node.id}-children`}>children</Label>
            <Input
              id={`composer-${node.id}-children`}
              size="sm"
              value={node.children}
              onChange={(e) => onUpdate({ children: e.target.value })}
            />
          </Field>
          {Object.entries(node.props).map(([key, value]) => {
            const inputId = `composer-${node.id}-${key}`;
            return (
              <Field key={key}>
                <Label htmlFor={inputId}>{key}</Label>
                {typeof value === "boolean" ? (
                  <Checkbox
                    id={inputId}
                    checked={value}
                    onChange={(e) =>
                      onUpdate({ props: { ...node.props, [key]: e.target.checked } })
                    }
                  />
                ) : (
                  <Input
                    id={inputId}
                    size="sm"
                    value={String(value)}
                    onChange={(e) =>
                      onUpdate({ props: { ...node.props, [key]: e.target.value } })
                    }
                  />
                )}
              </Field>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
