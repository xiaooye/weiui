"use client";

import { BarChart } from "@weiui/react/chart";

const DATA = [
  { name: "Jan", revenue: 4000, expenses: 2400 },
  { name: "Feb", revenue: 3000, expenses: 1398 },
  { name: "Mar", revenue: 5000, expenses: 2800 },
  { name: "Apr", revenue: 4500, expenses: 3900 },
  { name: "May", revenue: 6000, expenses: 4300 },
  { name: "Jun", revenue: 5400, expenses: 4100 },
  { name: "Jul", revenue: 6800, expenses: 4500 },
  { name: "Aug", revenue: 7200, expenses: 4800 },
];

const currency = (v: unknown) => `$${Number(v).toLocaleString()}`;

export function ChartBarDemo() {
  return (
    <div style={{ display: "grid", gap: "var(--wui-spacing-4)", width: "100%" }}>
      <BarChart
        data={DATA}
        dataKeys={["revenue", "expenses"]}
        title="Revenue vs Expenses"
        height={260}
        yAxisFormatter={currency}
      />
      <BarChart
        data={DATA}
        dataKeys={["revenue", "expenses"]}
        title="Stacked + brush"
        description="stacked prop shares a stackId across series; showBrush adds a zoom / pan control"
        height={260}
        stacked
        showBrush
        yAxisFormatter={currency}
      />
    </div>
  );
}
