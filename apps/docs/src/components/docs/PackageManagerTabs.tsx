"use client";

import { useState, useEffect } from "react";

interface Props {
  command: string; // e.g. "add @weiui/react"
}

const MANAGERS = [
  { id: "npm", label: "npm", prefix: "npm install" },
  { id: "pnpm", label: "pnpm", prefix: "pnpm add" },
  { id: "yarn", label: "yarn", prefix: "yarn add" },
  { id: "bun", label: "bun", prefix: "bun add" },
] as const;

type ManagerId = (typeof MANAGERS)[number]["id"];

export function PackageManagerTabs({ command }: Props) {
  const [active, setActive] = useState<ManagerId>("pnpm");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("wui-pm") as ManagerId | null;
    if (stored && MANAGERS.some((m) => m.id === stored)) setActive(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("wui-pm", active);
  }, [active]);

  const current = MANAGERS.find((m) => m.id === active)!;
  const full = `${current.prefix} ${command}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="wui-pm-tabs">
      <div className="wui-pm-tabs__row" role="tablist">
        {MANAGERS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active === m.id}
            onClick={() => setActive(m.id)}
            data-active={active === m.id || undefined}
            className="wui-pm-tabs__tab"
          >
            {m.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onCopy}
          className="wui-pm-tabs__copy"
          aria-label={copied ? "Copied" : "Copy command"}
        >
          {copied ? "✓" : "⧉"}
        </button>
      </div>
      <pre className="wui-pm-tabs__cmd"><code>{full}</code></pre>
    </div>
  );
}
