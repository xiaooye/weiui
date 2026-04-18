"use client";
import { Badge, Card, Container, Heading, Stack, Text } from "@weiui/react";
import { PackageManagerTabs } from "../docs/PackageManagerTabs";

export function InstallSnippet() {
  return (
    <Container maxWidth="72rem" className="wui-home-section wui-home-install">
      <Stack direction="column" gap={6}>
        <Stack direction="column" gap={3} className="wui-home-section__header">
          <Badge variant="soft" size="sm" className="wui-home-section__eyebrow">
            Get started
          </Badge>
          <Heading level={2} className="wui-home-section__title">
            One command.
          </Heading>
          <Text size="lg" color="muted" className="wui-home-section__sub">
            All you need is the React package {"\u2014"} tokens and CSS primitives come along for free.
          </Text>
        </Stack>
        <Card variant="outlined" className="wui-home-install__wrap">
          <PackageManagerTabs command="@weiui/react" />
        </Card>
      </Stack>
    </Container>
  );
}
