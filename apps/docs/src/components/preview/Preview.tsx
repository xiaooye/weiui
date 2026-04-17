"use client";

import { useState, type ReactNode } from "react";

export interface PreviewProps {
  children: ReactNode;
  code?: string;
  label?: string;
}

export function Preview({ children, code, label }: PreviewProps) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

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
        <div className="wui-preview__stage">{children}</div>
      ) : (
        <pre className="wui-preview__code"><code>{code}</code></pre>
      )}
    </div>
  );
}
