"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Code,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@weiui/react";

interface Props {
  command: string;
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
    } catch {
      /* ignored */
    }
  };

  return (
    <Tabs
      value={active}
      onValueChange={(v) => setActive(v as ManagerId)}
      className="wui-pm-tabs"
    >
      <Stack direction="row" gap={2} className="wui-pm-tabs__row">
        <TabsList className="wui-pm-tabs__list">
          {MANAGERS.map((m) => (
            <TabsTrigger key={m.id} value={m.id}>
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={onCopy}
              aria-label={copied ? "Copied" : "Copy command"}
              className="wui-pm-tabs__copy"
            >
              <span aria-hidden="true">{copied ? "\u2713" : "\u29C9"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied" : "Copy command"}</TooltipContent>
        </Tooltip>
      </Stack>
      {MANAGERS.map((m) => (
        <TabsContent key={m.id} value={m.id} className="wui-pm-tabs__panel">
          <pre className="wui-pm-tabs__cmd">
            <Code>{`${m.prefix} ${command}`}</Code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
}
