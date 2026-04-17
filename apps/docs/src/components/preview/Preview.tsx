"use client";

import { useState, type ReactNode } from "react";
import { PreviewFrame } from "./PreviewFrame";

export interface PreviewProps {
  children: ReactNode;
  code?: string;
  label?: string;
}

type ViewportPreset = "100%" | 768 | 375;

export function Preview({ children, code, label }: PreviewProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"inherit" | "light" | "dark">("inherit");
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [viewport, setViewport] = useState<ViewportPreset>("100%");

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const isolated = theme !== "inherit" || dir !== "ltr" || viewport !== "100%";

  return (
    <div className="wui-preview">
      <div className="wui-preview__header">
        {label && <span className="wui-preview__label">{label}</span>}
        <div className="wui-preview__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "preview"}
            onClick={() => setTab("preview")}
            className="wui-preview__tab"
            data-active={tab === "preview" || undefined}
          >
            Preview
          </button>
          {code && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "code"}
              onClick={() => setTab("code")}
              className="wui-preview__tab"
              data-active={tab === "code" || undefined}
            >
              Code
            </button>
          )}
        </div>
        <div className="wui-preview__actions">
          {tab === "preview" && (
            <>
              <SegmentToggle
                value={theme}
                options={[
                  { value: "inherit", label: "Auto" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                onChange={setTheme}
                aria-label="Theme"
              />
              <SegmentToggle
                value={dir}
                options={[
                  { value: "ltr", label: "LTR" },
                  { value: "rtl", label: "RTL" },
                ]}
                onChange={setDir}
                aria-label="Direction"
              />
              <SegmentToggle
                value={viewport}
                options={[
                  { value: "100%", label: "Full" },
                  { value: 768, label: "768" },
                  { value: 375, label: "375" },
                ]}
                onChange={setViewport}
                aria-label="Viewport"
              />
            </>
          )}
          {code && (
            <button
              type="button"
              onClick={onCopy}
              className="wui-preview__copy"
              aria-label={copied ? "Copied" : "Copy code"}
            >
              {copied ? "✓" : "⧉"}
            </button>
          )}
        </div>
      </div>
      {tab === "preview" ? (
        isolated ? (
          <div className="wui-preview__stage wui-preview__stage--frame">
            <PreviewFrame
              theme={theme === "inherit" ? "system" : theme}
              dir={dir}
              width={viewport}
            >
              {children}
            </PreviewFrame>
          </div>
        ) : (
          <div className="wui-preview__stage">{children}</div>
        )
      ) : (
        <pre className="wui-preview__code"><code>{code}</code></pre>
      )}
    </div>
  );
}

interface SegmentToggleProps<T extends string | number> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  "aria-label": string;
}

function SegmentToggle<T extends string | number>({ value, options, onChange, ...rest }: SegmentToggleProps<T>) {
  return (
    <div className="wui-preview__segment" role="radiogroup" aria-label={rest["aria-label"]}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className="wui-preview__segment-item"
          data-active={value === opt.value || undefined}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
