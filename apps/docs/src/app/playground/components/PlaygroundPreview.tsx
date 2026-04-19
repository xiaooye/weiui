"use client";
import { Card, CardContent, CardHeader, Text } from "@weiui/react";
import { renderComponent } from "../lib/render-component";

interface Props {
  componentName: string;
  props: Record<string, unknown>;
}

export function PlaygroundPreview({ componentName, props }: Props) {
  return (
    <Card className="wui-tool-preview">
      <CardHeader>
        <Text as="span" size="sm" weight="medium">
          Preview
        </Text>
      </CardHeader>
      <CardContent className="wui-tool-preview__stage">
        {renderComponent(componentName, props)}
      </CardContent>
    </Card>
  );
}
