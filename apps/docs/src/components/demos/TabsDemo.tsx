"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@weiui/react";

export function TabsDemo() {
  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <style>{`
        .tabs-demo-trigger {
          appearance: none;
          border: none;
          background: transparent;
          padding: var(--wui-spacing-2) var(--wui-spacing-4);
          font: inherit;
          font-size: var(--wui-font-size-sm);
          font-weight: var(--wui-font-weight-medium);
          color: var(--wui-color-muted-foreground);
          cursor: pointer;
          border-block-end: 2px solid transparent;
          margin-block-end: -1px;
          min-block-size: 44px;
          transition: color 0.15s ease;
        }
        .tabs-demo-trigger:hover { color: var(--wui-color-foreground); }
        .tabs-demo-trigger[aria-selected="true"] {
          color: var(--wui-color-primary);
          border-block-end-color: var(--wui-color-primary);
        }
        .tabs-demo-list {
          display: flex;
          gap: var(--wui-spacing-1);
          border-block-end: 1px solid var(--wui-color-border);
          margin-block-end: var(--wui-spacing-4);
        }
      `}</style>
      <Tabs defaultValue="overview">
        <TabsList className="tabs-demo-list">
          <TabsTrigger value="overview" className="tabs-demo-trigger">
            Overview
          </TabsTrigger>
          <TabsTrigger value="features" className="tabs-demo-trigger">
            Features
          </TabsTrigger>
          <TabsTrigger value="pricing" className="tabs-demo-trigger">
            Pricing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p style={{ margin: 0 }}>
            A business-level design system with three consumption layers — CSS, headless, and styled React.
          </p>
        </TabsContent>
        <TabsContent value="features">
          <ul style={{ margin: 0, paddingInlineStart: "var(--wui-spacing-5)" }}>
            <li>65 components</li>
            <li>WCAG AAA contrast</li>
            <li>Full keyboard support</li>
          </ul>
        </TabsContent>
        <TabsContent value="pricing">
          <p style={{ margin: 0 }}>Free and open source. MIT licensed.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
