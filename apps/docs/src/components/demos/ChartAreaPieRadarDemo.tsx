"use client";

import { AreaChart, PieChart, DonutChart, RadarChart } from "@weiui/react/chart";

const AREA_DATA = [
  { name: "Q1", users: 1200 },
  { name: "Q2", users: 1800 },
  { name: "Q3", users: 2400 },
  { name: "Q4", users: 3100 },
];

const PIE_DATA = [
  { name: "Desktop", value: 400 },
  { name: "Mobile", value: 300 },
  { name: "Tablet", value: 100 },
];

const RADAR_DATA = [
  { subject: "Speed", core: 120, plus: 110 },
  { subject: "Quality", core: 98, plus: 130 },
  { subject: "Cost", core: 86, plus: 130 },
  { subject: "UX", core: 99, plus: 100 },
  { subject: "A11y", core: 85, plus: 90 },
];

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "var(--wui-spacing-4)",
  width: "100%",
};

export function ChartAreaPieRadarDemo() {
  return (
    <div style={gridStyle}>
      <AreaChart data={AREA_DATA} dataKeys={["users"]} title="Users (Area)" height={220} />
      <PieChart data={PIE_DATA} title="Traffic (Pie)" height={220} />
      <DonutChart data={PIE_DATA} title="Traffic (Donut)" height={220} />
      <RadarChart data={RADAR_DATA} dataKeys={["core", "plus"]} title="Capability (Radar)" height={220} />
    </div>
  );
}
