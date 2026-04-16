"use client";

interface Props {
  code: string;
  codeMode: "jsx" | "html";
  onCodeModeChange: (mode: "jsx" | "html") => void;
}

export function CodeExport({ code, codeMode, onCodeModeChange }: Props) {
  return (
    <div className="wui-card">
      <div className="wui-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "var(--wui-spacing-2)" }}>
          <button
            type="button"
            aria-pressed={codeMode === "jsx"}
            className={`wui-button wui-button--${codeMode === "jsx" ? "soft" : "ghost"} wui-button--sm`}
            onClick={() => onCodeModeChange("jsx")}
          >JSX</button>
          <button
            type="button"
            aria-pressed={codeMode === "html"}
            className={`wui-button wui-button--${codeMode === "html" ? "soft" : "ghost"} wui-button--sm`}
            onClick={() => onCodeModeChange("html")}
          >HTML</button>
        </div>
        <button
          type="button"
          className="wui-button wui-button--ghost wui-button--sm"
          onClick={() => navigator.clipboard.writeText(code)}
        >Copy</button>
      </div>
      <div className="wui-card__content">
        <pre style={{ fontFamily: "var(--wui-font-family-mono)", fontSize: "var(--wui-font-size-sm)", overflow: "auto", minHeight: "60px" }}>
          <code>{code || "// Add components to see generated code"}</code>
        </pre>
      </div>
    </div>
  );
}
