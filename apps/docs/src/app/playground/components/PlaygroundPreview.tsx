"use client";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Spinner,
  Text,
} from "@weiui/react";
import type { ComponentDef } from "../lib/component-registry";

interface Props {
  component: ComponentDef;
  propValues: Record<string, string | boolean>;
  children: string;
}

export function PlaygroundPreview({ component, propValues, children }: Props) {
  return (
    <Card className="wui-tool-preview">
      <CardHeader>
        <Text as="span" size="sm" weight="medium">
          Preview
        </Text>
      </CardHeader>
      <CardContent className="wui-tool-preview__stage">
        {renderComponent(component.name, propValues, children)}
      </CardContent>
    </Card>
  );
}

function renderComponent(
  name: string,
  props: Record<string, string | boolean>,
  children: string,
) {
  switch (name) {
    case "Button":
      return (
        <Button
          variant={(props.variant as "solid" | "outline" | "ghost" | "soft" | "link") ?? "solid"}
          size={(props.size as "sm" | "md" | "lg" | "xl") ?? "md"}
          color={(props.color as "primary" | "destructive" | "success" | "warning") ?? "primary"}
          disabled={!!props.disabled}
          loading={!!props.loading}
        >
          {children}
        </Button>
      );
    case "Input":
      return (
        <Input
          placeholder={typeof props.placeholder === "string" ? props.placeholder : ""}
          disabled={!!props.disabled}
          invalid={!!props.invalid}
        />
      );
    case "Badge":
      return (
        <Badge
          variant={(props.variant as "solid" | "soft" | "outline") ?? "solid"}
          color={(props.color as "primary" | "destructive" | "success" | "warning") ?? "primary"}
        >
          {children}
        </Badge>
      );
    case "Alert":
      return (
        <Alert variant={(props.variant as "info" | "success" | "warning" | "destructive") ?? "info"}>
          {children}
        </Alert>
      );
    case "Spinner":
      return (
        <Spinner
          size={(props.size as "sm" | "md" | "lg") ?? "md"}
          label={typeof props.label === "string" ? props.label : "Loading"}
        />
      );
    default:
      return <Text>{children}</Text>;
  }
}
