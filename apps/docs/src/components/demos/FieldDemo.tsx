"use client";

import { useState } from "react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  Input,
} from "@weiui/react";

export function FieldDemo() {
  const [email, setEmail] = useState("not-an-email");
  const valid = /@/.test(email);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-4)",
        inlineSize: "320px",
      }}
    >
      <Field required>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" placeholder="you@example.com" />
        <FieldDescription>
          We&apos;ll only use this to send receipts.
        </FieldDescription>
      </Field>

      <Field error={valid ? undefined : "Please enter a valid email address"}>
        <FieldLabel>Verify email</FieldLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
    </div>
  );
}
