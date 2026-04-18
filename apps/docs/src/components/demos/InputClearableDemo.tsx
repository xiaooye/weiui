"use client";

import { useState } from "react";
import { Input } from "@weiui/react";
import { Eye, EyeOff } from "@weiui/icons";

export function InputClearableDemo() {
  const [name, setName] = useState("Jane Doe");
  const [message, setMessage] = useState("Hello from WeiUI");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-3)", maxWidth: 320 }}>
      <Input
        aria-label="Full name"
        placeholder="Full name"
        clearable
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        aria-label="Status"
        placeholder="Write a short status…"
        maxLength={60}
        showCount
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Input
        aria-label="Password"
        type={show ? "text" : "password"}
        placeholder="Password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        suffix={
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              padding: 0,
              display: "inline-flex",
              alignItems: "center",
              color: "var(--wui-color-muted-foreground)",
            }}
          >
            {show ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
          </button>
        }
      />
    </div>
  );
}
