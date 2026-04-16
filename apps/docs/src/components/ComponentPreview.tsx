export function ComponentPreview({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div style={{
      border: "1px solid var(--wui-color-border)",
      borderRadius: "var(--wui-shape-radius-lg)",
      marginBlockEnd: "var(--wui-spacing-4)",
      overflow: "hidden",
    }}>
      {label && (
        <div style={{
          padding: "var(--wui-spacing-2) var(--wui-spacing-4)",
          fontSize: "var(--wui-font-size-xs)",
          color: "var(--wui-color-muted-foreground)",
          borderBlockEnd: "1px solid var(--wui-color-border)",
          backgroundColor: "var(--wui-color-muted)",
        }}>
          {label}
        </div>
      )}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--wui-spacing-3)",
        alignItems: "center",
        padding: "var(--wui-spacing-6)",
      }}>
        {children}
      </div>
    </div>
  );
}
