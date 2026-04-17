"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@weiui/react";

export function TabsDemo() {
  return (
    <div style={{ width: "100%", maxWidth: "480px" }}>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
