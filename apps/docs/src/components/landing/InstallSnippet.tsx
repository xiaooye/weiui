"use client";
import { Badge, Card, Container, Heading, Stack, Text } from "civaria";
import { PackageManagerTabs } from "../docs/PackageManagerTabs";

export function InstallSnippet() {
  return (
    <Container maxWidth="72rem" className="civ-home-section civ-home-install">
      <Stack direction="column" gap={6}>
        <Stack direction="column" gap={3} className="civ-home-section__header">
          <Badge variant="soft" size="sm" className="civ-home-section__eyebrow">
            Get started
          </Badge>
          <Heading level={2} className="civ-home-section__title">
            One command.
          </Heading>
          <Text size="lg" color="muted" className="civ-home-section__sub">
            All you need is the React package {"\u2014"} tokens and CSS primitives come along for free.
          </Text>
        </Stack>
        <Card variant="outlined" className="civ-home-install__wrap">
          <PackageManagerTabs command="civaria" />
        </Card>
      </Stack>
    </Container>
  );
}
