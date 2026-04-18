"use client";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Heading,
  Input,
  Stack,
  Text,
} from "@weiui/react";
import type { ThemeResult } from "../lib/theme-generator";

interface Props {
  theme: ThemeResult;
}

export function ThemePreview({ theme }: Props) {
  const style = {
    "--wui-color-primary": theme.colors.primary,
    "--wui-color-primary-foreground": theme.colors.primaryForeground,
    "--wui-color-ring": theme.colors.ring,
  } as React.CSSProperties;

  return (
    <div style={style}>
      <Card>
        <CardHeader>
          <Text as="span" size="sm" weight="semibold">
            Preview
          </Text>
        </CardHeader>
        <CardContent>
          <Stack direction="column" gap={6}>
            <Stack direction="column" gap={3}>
              <Heading level={3} className="wui-theme-preview__section-title">
                Buttons
              </Heading>
              <Stack direction="row" gap={3} wrap>
                <Button variant="solid">Solid</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="soft">Soft</Button>
              </Stack>
            </Stack>
            <Stack direction="column" gap={3}>
              <Heading level={3} className="wui-theme-preview__section-title">
                Badges
              </Heading>
              <Stack direction="row" gap={2} wrap>
                <Badge variant="solid">Solid</Badge>
                <Badge variant="soft">Soft</Badge>
                <Badge variant="outline">Outline</Badge>
              </Stack>
            </Stack>
            <Stack direction="column" gap={3}>
              <Heading level={3} className="wui-theme-preview__section-title">
                Input
              </Heading>
              <Input
                placeholder="Type something..."
                aria-label="Sample input"
                className="wui-theme-preview__input"
              />
            </Stack>
            <Stack direction="column" gap={3}>
              <Heading level={3} className="wui-theme-preview__section-title">
                Card
              </Heading>
              <Card className="wui-theme-preview__card">
                <CardHeader>
                  <Text as="span" weight="semibold">
                    Card Title
                  </Text>
                </CardHeader>
                <CardContent>
                  <Text size="sm" color="muted">
                    Card content with custom theme.
                  </Text>
                </CardContent>
                <CardFooter>
                  <Button variant="solid" size="sm">
                    Action
                  </Button>
                </CardFooter>
              </Card>
            </Stack>
            <Stack direction="column" gap={3}>
              <Heading level={3} className="wui-theme-preview__section-title">
                Avatar
              </Heading>
              <Stack direction="row" gap={2}>
                <Avatar size="sm">
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <Avatar size="lg">
                  <AvatarFallback>L</AvatarFallback>
                </Avatar>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
