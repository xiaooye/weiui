"use client";

import { BarChart } from "@weiui/react/chart";

const DATA = [
  { name: "Jan", revenue: 4000, expenses: 2400 },
  { name: "Feb", revenue: 3000, expenses: 1398 },
  { name: "Mar", revenue: 5000, expenses: 2800 },
  { name: "Apr", revenue: 4500, expenses: 3900 },
  { name: "May", revenue: 6000, expenses: 4300 },
];

export function ChartBarDemo() {
  return (
    <div style={{ width: "100%" }}>
      <BarChart
        data={DATA}
        dataKeys={["revenue", "expenses"]}
        title="Revenue vs Expenses"
        height={260}
      />
    </div>
  );
}
