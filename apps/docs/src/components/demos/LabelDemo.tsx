"use client";

import { useState } from "react";
import { Label, Input } from "@weiui/react";

export function LabelDemo() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-4)",
        inlineSize: "280px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--wui-spacing-1)",
        }}
      >
        <Label htmlFor="label-demo-email">Email</Label>
        <Input
          id="label-demo-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--wui-spacing-1)",
        }}
      >
        <Label htmlFor="label-demo-name" required>
          Full name
        </Label>
        <Input
          id="label-demo-name"
          placeholder="Ada Lovelace"
          aria-required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
    </div>
  );
}
