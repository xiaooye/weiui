"use client";
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Field,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Text,
} from "@weiui/react";
export interface PropDef {
  name: string;
  type: "select" | "boolean" | "text";
  options?: string[];
  defaultValue: string | boolean;
}

export interface ComponentDef {
  name: string;
  category: string;
  props: PropDef[];
  defaultChildren: string;
}

interface Props {
  component: ComponentDef;
  propValues: Record<string, string | boolean>;
  onPropChange: (name: string, value: string | boolean) => void;
  children: string;
  onChildrenChange: (value: string) => void;
}

export function PropsPanel({
  component,
  propValues,
  onPropChange,
  children,
  onChildrenChange,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <Text as="span" size="sm" weight="medium">
          Props
        </Text>
      </CardHeader>
      <CardContent>
        <Stack direction="column" gap={3}>
          {component.defaultChildren !== "" && (
            <Field>
              <Label htmlFor="prop-children">children</Label>
              <Input
                id="prop-children"
                size="sm"
                value={children}
                onChange={(e) => onChildrenChange(e.target.value)}
              />
            </Field>
          )}
          {component.props.map((prop) => (
            <PropControl
              key={prop.name}
              prop={prop}
              value={propValues[prop.name]!}
              onChange={(v) => onPropChange(prop.name, v)}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PropControl({
  prop,
  value,
  onChange,
}: {
  prop: PropDef;
  value: string | boolean;
  onChange: (v: string | boolean) => void;
}) {
  switch (prop.type) {
    case "select":
      return (
        <Field>
          <Label htmlFor={`prop-${prop.name}`}>{prop.name}</Label>
          <Select value={String(value)} onValueChange={(v) => onChange(v)}>
            <SelectTrigger id={`prop-${prop.name}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prop.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      );
    case "boolean":
      return (
        <Stack direction="row" gap={2}>
          <Checkbox
            id={`prop-${prop.name}`}
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <Label htmlFor={`prop-${prop.name}`}>{prop.name}</Label>
        </Stack>
      );
    case "text":
      return (
        <Field>
          <Label htmlFor={`prop-${prop.name}`}>{prop.name}</Label>
          <Input
            id={`prop-${prop.name}`}
            size="sm"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );
  }
}
