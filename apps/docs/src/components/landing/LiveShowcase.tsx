"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Avatar,
  AvatarFallback,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Chip,
  Badge,
} from "@weiui/react";

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
    <section className="wui-home-section wui-home-showcase">
      <header className="wui-home-section__header">
        <span className="wui-home-section__eyebrow">Live preview</span>
        <h2 className="wui-home-section__title">Components, live — not screenshots.</h2>
        <p className="wui-home-section__sub">
          Everything below is rendered with the same tokens your app will use. Toggle the theme from the header to see dark mode in real time.
        </p>
      </header>

      <div className="wui-home-showcase__tabs" role="tablist" aria-label="Component preview">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            id={`wui-showcase-tab-${d.id}`}
            aria-selected={active === d.id}
            aria-controls={`wui-showcase-panel-${d.id}`}
            tabIndex={active === d.id ? 0 : -1}
            onClick={() => setActive(d.id)}
            onKeyDown={(e) => {
              const idx = DEMOS.findIndex((x) => x.id === active);
              const goto = (i: number) => {
                const next = DEMOS[((i % DEMOS.length) + DEMOS.length) % DEMOS.length];
                if (next) setActive(next.id);
              };
              if (e.key === "ArrowRight") {
                e.preventDefault();
                goto(idx + 1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                goto(idx - 1);
              } else if (e.key === "Home") {
                e.preventDefault();
                goto(0);
              } else if (e.key === "End") {
                e.preventDefault();
                goto(DEMOS.length - 1);
              }
            }}
            className="wui-home-showcase__tab"
            data-active={active === d.id || undefined}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div
        className="wui-home-showcase__stage"
        role="tabpanel"
        id={`wui-showcase-panel-${active}`}
        aria-labelledby={`wui-showcase-tab-${active}`}
      >
        {active === "buttons" && <ButtonDemo />}
        {active === "form" && <FormDemo />}
        {active === "card" && <CardDemo />}
        {active === "chips" && <ChipDemo />}
      </div>
    </section>
  );
}

function ButtonDemo() {
  return (
    <div className="wui-home-showcase__row">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="solid" color="destructive">Delete</Button>
      <Button variant="solid" loading>Loading…</Button>
    </div>
  );
}

function FormDemo() {
  return (
    <div className="wui-home-showcase__form">
      <div>
        <Label htmlFor="wui-demo-email" className="wui-home-showcase__label">Email</Label>
        <Input id="wui-demo-email" type="email" placeholder="ada@example.com" />
      </div>
      <div>
        <Label htmlFor="wui-demo-pass" className="wui-home-showcase__label">Password</Label>
        <Input id="wui-demo-pass" type="password" placeholder="••••••••" />
      </div>
      <Button variant="solid" type="button">Sign in</Button>
    </div>
  );
}

function CardDemo() {
  return (
    <Card style={{ maxInlineSize: "360px" }}>
      <CardHeader>
        <Avatar>
          <AvatarFallback>WU</AvatarFallback>
        </Avatar>
        <div>
          <div style={{ fontWeight: "var(--wui-font-weight-semibold)" }}>WeiUI Shipped</div>
          <div style={{ fontSize: "var(--wui-font-size-xs)", color: "var(--wui-color-muted-foreground)" }}>v0.0.1 · 2 days ago</div>
        </div>
      </CardHeader>
      <CardContent>
        Phase 0 foundations landed — new shadow, motion, elevation tokens and a polish recipe applied to 36 component CSS files.
      </CardContent>
      <CardFooter>
        <Button variant="soft" size="sm">View</Button>
        <Button variant="ghost" size="sm">Dismiss</Button>
      </CardFooter>
    </Card>
  );
}

function ChipDemo() {
  return (
    <div className="wui-home-showcase__row">
      <Chip>Default</Chip>
      <Chip color="primary">Primary</Chip>
      <Chip color="success">Shipped</Chip>
      <Chip color="destructive">Breaking</Chip>
      <Badge variant="solid">New</Badge>
      <Badge variant="soft">Beta</Badge>
      <Badge variant="outline">v0</Badge>
      <Badge variant="solid" color="success">AAA</Badge>
    </div>
  );
}
