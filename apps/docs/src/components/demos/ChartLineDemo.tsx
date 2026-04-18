"use client";

import { LineChart } from "@weiui/react/chart";

const DATA = [
  { name: "Mon", visits: 210, signups: 42 },
  { name: "Tue", visits: 340, signups: 61 },
  { name: "Wed", visits: 290, signups: 53 },
  { name: "Thu", visits: 420, signups: 78 },
  { name: "Fri", visits: 510, signups: 94 },
  { name: "Sat", visits: 380, signups: 71 },
  { name: "Sun", visits: 260, signups: 48 },
];

const thousands = (v: unknown) =>
  typeof v === "number" && v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);

export function ChartLineDemo() {
  return (
    <div style={{ display: "grid", gap: "var(--wui-spacing-4)", width: "100%" }}>
      <LineChart
        data={DATA}
        dataKeys={["visits", "signups"]}
        title="Weekly visits"
        height={260}
        yAxisFormatter={thousands}
      />
      <LineChart
        data={[]}
        dataKeys={["visits"]}
        title="Empty state"
        description="Pass an empty array to trigger the default EmptyState"
        height={200}
      />
    </div>
  );
}
