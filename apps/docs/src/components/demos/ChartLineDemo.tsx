"use client";

import { LineChart } from "@weiui/react/chart";

const DATA = [
  { name: "Mon", visits: 210 },
  { name: "Tue", visits: 340 },
  { name: "Wed", visits: 290 },
  { name: "Thu", visits: 420 },
  { name: "Fri", visits: 510 },
  { name: "Sat", visits: 380 },
  { name: "Sun", visits: 260 },
];

export function ChartLineDemo() {
  return (
    <div style={{ width: "100%" }}>
      <LineChart
        data={DATA}
        dataKeys={["visits"]}
        title="Weekly visits"
        height={260}
      />
    </div>
  );
}
