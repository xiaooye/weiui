"use client";
import { forwardRef, type ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  AreaChart as ReAreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  RadarChart as ReRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "../../utils/cn";

const COLORS = [
  "var(--wui-color-primary)",
  "var(--wui-color-success)",
  "var(--wui-color-warning)",
  "var(--wui-color-destructive)",
  "var(--wui-color-info)",
  "oklch(0.7 0.15 300)",
  "oklch(0.6 0.15 180)",
  "oklch(0.65 0.15 60)",
];

interface ChartWrapperProps {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
  height?: number;
}

const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  ({ title, description, className, children, height = 300 }, ref) => (
    <div ref={ref} className={cn("wui-chart", className)}>
      {title && <div className="wui-chart__title">{title}</div>}
      {description && <div className="wui-chart__description">{description}</div>}
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  ),
);
ChartWrapper.displayName = "ChartWrapper";

export interface ChartProps {
  data: Record<string, unknown>[];
  dataKeys: string[];
  xKey?: string;
  title?: ReactNode;
  description?: ReactNode;
  height?: number;
  className?: string;
  colors?: string[];
}

export const BarChart = forwardRef<HTMLDivElement, ChartProps>(
  ({ data, dataKeys, xKey = "name", colors = COLORS, ...rest }, ref) => (
    <ChartWrapper ref={ref} {...rest}>
      <ReBarChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Bar chart"}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {dataKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
        ))}
      </ReBarChart>
    </ChartWrapper>
  ),
);
BarChart.displayName = "BarChart";

export const LineChart = forwardRef<HTMLDivElement, ChartProps>(
  ({ data, dataKeys, xKey = "name", colors = COLORS, ...rest }, ref) => (
    <ChartWrapper ref={ref} {...rest}>
      <ReLineChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Line chart"}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {dataKeys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </ReLineChart>
    </ChartWrapper>
  ),
);
LineChart.displayName = "LineChart";

export const AreaChart = forwardRef<HTMLDivElement, ChartProps>(
  ({ data, dataKeys, xKey = "name", colors = COLORS, ...rest }, ref) => (
    <ChartWrapper ref={ref} {...rest}>
      <ReAreaChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Area chart"}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {dataKeys.map((key, i) => (
          <Area key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} />
        ))}
      </ReAreaChart>
    </ChartWrapper>
  ),
);
AreaChart.displayName = "AreaChart";

export interface PieChartProps {
  data: { name: string; value: number }[];
  title?: ReactNode;
  description?: ReactNode;
  height?: number;
  className?: string;
  colors?: string[];
  donut?: boolean;
}

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  ({ data, colors = COLORS, donut, ...rest }, ref) => (
    <ChartWrapper ref={ref} {...rest}>
      <RePieChart role="img" aria-label={typeof rest.title === "string" ? rest.title : "Pie chart"}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={donut ? "50%" : 0}
          outerRadius="80%"
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RePieChart>
    </ChartWrapper>
  ),
);
PieChart.displayName = "PieChart";

export const DonutChart = forwardRef<HTMLDivElement, Omit<PieChartProps, "donut">>(
  (props, ref) => <PieChart ref={ref} {...props} donut />,
);
DonutChart.displayName = "DonutChart";

export interface RadarChartProps {
  data: Record<string, unknown>[];
  dataKeys: string[];
  angleKey?: string;
  title?: ReactNode;
  description?: ReactNode;
  height?: number;
  className?: string;
  colors?: string[];
}

export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  ({ data, dataKeys, angleKey = "subject", colors = COLORS, ...rest }, ref) => (
    <ChartWrapper ref={ref} {...rest}>
      <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="80%" role="img" aria-label={typeof rest.title === "string" ? rest.title : "Radar chart"}>
        <PolarGrid />
        <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 12 }} />
        <PolarRadiusAxis tick={{ fontSize: 10 }} />
        {dataKeys.map((key, i) => (
          <Radar key={key} dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} />
        ))}
        <Tooltip />
        <Legend />
      </ReRadarChart>
    </ChartWrapper>
  ),
);
RadarChart.displayName = "RadarChart";
