"use client";

import { useRef, useState, type HTMLAttributes } from "react";

export function CodeBlock({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="wui-code-block">
      <button
        type="button"
        className="wui-code-block__copy"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy code"}
      >
        {copied ? "✓" : "⧉"}
      </button>
      <pre ref={ref} {...props}>{children}</pre>
    </div>
  );
}
