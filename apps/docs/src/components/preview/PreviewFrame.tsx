"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PreviewFrameProps {
  children: ReactNode;
  theme: "light" | "dark" | "system";
  dir: "ltr" | "rtl";
  width: number | "100%";
}

export function PreviewFrame({ children, theme, dir, width }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [container, setContainer] = useUseContainer();

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const sheets = Array.from(document.styleSheets)
      .map((s) => {
        try {
          return (s.ownerNode as HTMLElement)?.outerHTML ?? "";
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .join("\n");

    const resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html dir="${dir}" data-theme="${resolved}" class="${resolved === "dark" ? "dark" : ""}">
  <head>
    ${sheets}
    <style>
      body { margin: 0; padding: 24px; font-family: var(--wui-font-family-sans); background: var(--wui-color-background); color: var(--wui-color-foreground); }
      #wui-preview-root { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    </style>
  </head>
  <body><div id="wui-preview-root"></div></body>
</html>`);
    doc.close();

    const root = doc.getElementById("wui-preview-root");
    setContainer(root);
  }, [theme, dir, setContainer]);

  const inlineSize = width === "100%" ? "100%" : `${width}px`;

  return (
    <>
      <iframe
        ref={iframeRef}
        className="wui-preview__frame"
        style={{ inlineSize, blockSize: 320, border: 0 }}
        title="Component preview"
      />
      {container && createPortal(children, container)}
    </>
  );
}

function useUseContainer(): [HTMLElement | null, (el: HTMLElement | null) => void] {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = (el: HTMLElement | null) => {
    ref.current = el;
  };
  return [ref.current, setRef];
}
