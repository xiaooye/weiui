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
} from "civaria";

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
    const stored = localStorage.getItem("civ-pm") as ManagerId | null;
    if (stored && MANAGERS.some((m) => m.id === stored)) setActive(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("civ-pm", active);
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
      className="civ-pm-tabs"
    >
      <Stack direction="row" gap={2} className="civ-pm-tabs__row">
        <TabsList className="civ-pm-tabs__list">
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
              className="civ-pm-tabs__copy"
            >
              <span aria-hidden="true">{copied ? "\u2713" : "\u29C9"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied" : "Copy command"}</TooltipContent>
        </Tooltip>
      </Stack>
      {MANAGERS.map((m) => (
        <TabsContent key={m.id} value={m.id} className="civ-pm-tabs__panel">
          <pre className="civ-pm-tabs__cmd">
            <Code>{`${m.prefix} ${command}`}</Code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  );
}
