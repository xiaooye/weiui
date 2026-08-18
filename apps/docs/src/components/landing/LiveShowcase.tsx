"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Chip,
  Container,
  Field,
  Heading,
  Label,
  Input,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "civaria";

const DEMOS = [
  { id: "buttons", label: "Buttons" },
  { id: "form", label: "Form" },
  { id: "card", label: "Card" },
  { id: "chips", label: "Chips" },
] as const;

type DemoId = (typeof DEMOS)[number]["id"];

export function LiveShowcase() {
  const [active, setActive] = useState<DemoId>("buttons");

  return (
    <Container maxWidth="72rem" className="civ-home-section civ-home-showcase">
      <Stack direction="column" gap={6}>
        <Stack direction="column" gap={3} className="civ-home-section__header">
          <Badge variant="soft" size="sm" className="civ-home-section__eyebrow">
            Live preview
          </Badge>
          <Heading level={2} className="civ-home-section__title">
            Components, live {"\u2014"} not screenshots.
          </Heading>
          <Text size="lg" color="muted" className="civ-home-section__sub">
            Everything below is rendered with the same tokens your app will use. Toggle the theme
            from the header to see dark mode in real time.
          </Text>
        </Stack>
        <Tabs
          value={active}
          onValueChange={(v) => setActive(v as DemoId)}
          className="civ-home-showcase"
        >
          <TabsList aria-label="Component preview">
            {DEMOS.map((d) => (
              <TabsTrigger key={d.id} value={d.id}>
                {d.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="buttons" className="civ-home-showcase__stage">
            <ButtonDemo />
          </TabsContent>
          <TabsContent value="form" className="civ-home-showcase__stage">
            <FormDemo />
          </TabsContent>
          <TabsContent value="card" className="civ-home-showcase__stage">
            <CardDemo />
          </TabsContent>
          <TabsContent value="chips" className="civ-home-showcase__stage">
            <ChipDemo />
          </TabsContent>
        </Tabs>
      </Stack>
    </Container>
  );
}

function ButtonDemo() {
  return (
    <Stack direction="row" gap={3} wrap className="civ-home-showcase__row">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="solid" color="destructive">
        Delete
      </Button>
      <Button variant="solid" loading>
        Loading{"\u2026"}
      </Button>
    </Stack>
  );
}

function FormDemo() {
  return (
    <Stack direction="column" gap={3} className="civ-home-showcase__form">
      <Field>
        <Label htmlFor="civ-demo-email">Email</Label>
        <Input id="civ-demo-email" type="email" placeholder="ada@example.com" />
      </Field>
      <Field>
        <Label htmlFor="civ-demo-pass">Password</Label>
        <Input
          id="civ-demo-pass"
          type="password"
          placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
        />
      </Field>
      <Button variant="solid" type="button">
        Sign in
      </Button>
    </Stack>
  );
}

function CardDemo() {
  return (
    <Card className="civ-home-showcase__card">
      <CardHeader>
        <Stack direction="row" gap={3}>
          <Avatar>
            <AvatarFallback>WU</AvatarFallback>
          </Avatar>
          <Stack direction="column" gap={0}>
            <Text as="span" weight="semibold">
              Civaria Shipped
            </Text>
            <Text as="span" size="xs" color="muted">
              v0.0.1 {"\u00B7"} 2 days ago
            </Text>
          </Stack>
        </Stack>
      </CardHeader>
      <CardContent>
        <Text size="sm">
          Phase 0 foundations landed {"\u2014"} new shadow, motion, elevation tokens and a polish
          recipe applied to 36 component CSS files.
        </Text>
      </CardContent>
      <CardFooter>
        <Button variant="soft" size="sm">
          View
        </Button>
        <Button variant="ghost" size="sm">
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}

function ChipDemo() {
  return (
    <Stack direction="row" gap={3} wrap className="civ-home-showcase__row">
      <Chip>Default</Chip>
      <Chip color="primary">Primary</Chip>
      <Chip color="success">Shipped</Chip>
      <Chip color="destructive">Breaking</Chip>
      <Badge variant="solid">New</Badge>
      <Badge variant="soft">Beta</Badge>
      <Badge variant="outline">v0</Badge>
      <Badge variant="solid" color="success">
        AAA
      </Badge>
    </Stack>
  );
}
