"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Button,
  Code,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@weiui/react";
import { PALETTE_ITEMS } from "../../app/composer/lib/component-tree";
import { PreviewFrame } from "./PreviewFrame";

export interface PreviewProps {
  children: ReactNode;
  code?: string;
  label?: string;
  component?: string;
}

type ViewportPreset = "100%" | "768" | "375";
type TabId = "preview" | "code";

export function Preview({ children, code, label, component }: PreviewProps) {
  const [tab, setTab] = useState<TabId>("preview");
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"inherit" | "light" | "dark">("inherit");
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [viewport, setViewport] = useState<ViewportPreset>("100%");

  const isComposable =
    component !== undefined &&
    PALETTE_ITEMS.some((p) => p.type === component);

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignored */
    }
  };

  const isolated = theme !== "inherit" || dir !== "ltr" || viewport !== "100%";

  return (
    <div className="wui-preview">
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <Stack direction="row" gap={3} wrap className="wui-preview__header">
          {label && (
            <Text as="span" size="sm" weight="medium" className="wui-preview__label">
              {label}
            </Text>
          )}
          {code ? (
            <TabsList aria-label={label ? `${label} view` : "Preview view"}>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          ) : null}
          <Stack direction="row" gap={2} wrap className="wui-preview__actions">
            {tab === "preview" && (
              <>
                <ToggleGroup
                  type="single"
                  value={theme}
                  onChange={(v) => {
                    const next = Array.isArray(v) ? v[0] : v;
                    if (next) setTheme(next as "inherit" | "light" | "dark");
                  }}
                  label="Theme"
                >
                  <ToggleGroupItem value="inherit">Auto</ToggleGroupItem>
                  <ToggleGroupItem value="light">Light</ToggleGroupItem>
                  <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                </ToggleGroup>
                <ToggleGroup
                  type="single"
                  value={dir}
                  onChange={(v) => {
                    const next = Array.isArray(v) ? v[0] : v;
                    if (next) setDir(next as "ltr" | "rtl");
                  }}
                  label="Direction"
                >
                  <ToggleGroupItem value="ltr">LTR</ToggleGroupItem>
                  <ToggleGroupItem value="rtl">RTL</ToggleGroupItem>
                </ToggleGroup>
                <ToggleGroup
                  type="single"
                  value={viewport}
                  onChange={(v) => {
                    const next = Array.isArray(v) ? v[0] : v;
                    if (next) setViewport(next as ViewportPreset);
                  }}
                  label="Viewport"
                >
                  <ToggleGroupItem value="100%">Full</ToggleGroupItem>
                  <ToggleGroupItem value="768">768</ToggleGroupItem>
                  <ToggleGroupItem value="375">375</ToggleGroupItem>
                </ToggleGroup>
              </>
            )}
            {code && (
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    onClick={onCopy}
                    aria-label={copied ? "Copied" : "Copy code"}
                  >
                    <span aria-hidden="true">{copied ? "\u2713" : "\u29C9"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied" : "Copy code"}</TooltipContent>
              </Tooltip>
            )}
            {isComposable ? (
              <Link
                href={`/composer?add=${encodeURIComponent(component!)}`}
                className="wui-preview__edit-link"
              >
                Edit in Composer <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </Stack>
        </Stack>
        <TabsContent value="preview" className="wui-preview__stage-wrap">
          {isolated ? (
            <div className="wui-preview__stage wui-preview__stage--frame">
              <PreviewFrame
                theme={theme === "inherit" ? "system" : theme}
                dir={dir}
                width={viewport === "100%" ? "100%" : Number(viewport)}
              >
                {children}
              </PreviewFrame>
            </div>
          ) : (
            <div className="wui-preview__stage">{children}</div>
          )}
        </TabsContent>
        {code && (
          <TabsContent value="code" className="wui-preview__code-wrap">
            <pre className="wui-preview__code">
              <Code>{code}</Code>
            </pre>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
