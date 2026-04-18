"use client";
import { forwardRef, useEffect, useState, type ReactNode } from "react";
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
import { VisuallyHidden } from "../VisuallyHidden";

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

/** SSR-safe matchMedia hook for prefers-reduced-motion. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

interface DataTableProps {
  columns: string[];
  rows: (string | number)[][];
  caption?: string;
}

function ChartDataTable({ columns, rows, caption }: DataTableProps) {
  return (
    <VisuallyHidden>
      <table>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </VisuallyHidden>
  );
}

interface ChartWrapperProps {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
  height?: number;
  dataTable?: DataTableProps;
}

const ChartWrapper = forwardRef<HTMLDivElement, ChartWrapperProps>(
  ({ title, description, className, children, height = 300, dataTable }, ref) => (
    <div ref={ref} className={cn("wui-chart", className)}>
      {title && <div className="wui-chart__title">{title}</div>}
      {description && <div className="wui-chart__description">{description}</div>}
      <ResponsiveContainer width="100%" height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
      {dataTable && <ChartDataTable {...dataTable} />}
    </div>
  ),
);
ChartWrapper.displayName = "ChartWrapper";

export interface ChartProps {
  /** Array of data rows; each row is a record keyed by `xKey` plus each `dataKeys` entry. */
  data: Record<string, unknown>[];
  /** Keys within each row used as series (one line/bar/area per key). */
  dataKeys: string[];
  /** Key within each row used for the x-axis category. @default "name" */
  xKey?: string;
  /** Chart title rendered above the plot and used as `aria-label` fallback. */
  title?: ReactNode;
  /** Secondary description rendered under the title. */
  description?: ReactNode;
  /** Plot height in pixels. */
  height?: number;
  /** Additional CSS classes merged onto the chart wrapper. */
  className?: string;
  /** Palette for series colors. Cycles if there are more series than colors. */
  colors?: string[];
}

function stringify(v: unknown): string | number {
  if (typeof v === "number" || typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

function buildTable(
  data: Record<string, unknown>[],
  dataKeys: string[],
  xKey: string,
): DataTableProps {
  return {
    columns: [xKey, ...dataKeys],
    rows: data.map((d) => [stringify(d[xKey]), ...dataKeys.map((k) => stringify(d[k]))]),
  };
}

export const BarChart = forwardRef<HTMLDivElement, ChartProps>(
  ({ data, dataKeys, xKey = "name", colors = COLORS, ...rest }, ref) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    return (
      <ChartWrapper ref={ref} {...rest} dataTable={buildTable(data, dataKeys, xKey)}>
        <ReBarChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Bar chart"}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} isAnimationActive={animated} />
          ))}
        </ReBarChart>
      </ChartWrapper>
    );
  },
);
BarChart.displayName = "BarChart";

export const LineChart = forwardRef<HTMLDivElement, ChartProps>(
  ({ data, dataKeys, xKey = "name", colors = COLORS, ...rest }, ref) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    return (
      <ChartWrapper ref={ref} {...rest} dataTable={buildTable(data, dataKeys, xKey)}>
        <ReLineChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Line chart"}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, i) => (
            <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={animated} />
          ))}
        </ReLineChart>
      </ChartWrapper>
    );
  },
);
LineChart.displayName = "LineChart";

export const AreaChart = forwardRef<HTMLDivElement, ChartProps>(
  ({ data, dataKeys, xKey = "name", colors = COLORS, ...rest }, ref) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    return (
      <ChartWrapper ref={ref} {...rest} dataTable={buildTable(data, dataKeys, xKey)}>
        <ReAreaChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Area chart"}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, i) => (
            <Area key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} isAnimationActive={animated} />
          ))}
        </ReAreaChart>
      </ChartWrapper>
    );
  },
);
AreaChart.displayName = "AreaChart";

export interface PieChartProps {
  /** Slice data — each entry is `{ name, value }`. */
  data: { name: string; value: number }[];
  /** Chart title rendered above the plot. */
  title?: ReactNode;
  /** Secondary description rendered under the title. */
  description?: ReactNode;
  /** Plot height in pixels. */
  height?: number;
  /** Additional CSS classes merged onto the chart wrapper. */
  className?: string;
  /** Palette for slice colors. Cycles if there are more slices than colors. */
  colors?: string[];
  /** When true, renders as a donut (inner radius cut-out). */
  donut?: boolean;
}

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  ({ data, colors = COLORS, donut, ...rest }, ref) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    return (
      <ChartWrapper
        ref={ref}
        {...rest}
        dataTable={{
          columns: ["name", "value"],
          rows: data.map((d) => [d.name, d.value]),
        }}
      >
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
            isAnimationActive={animated}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RePieChart>
      </ChartWrapper>
    );
  },
);
PieChart.displayName = "PieChart";

export const DonutChart = forwardRef<HTMLDivElement, Omit<PieChartProps, "donut">>(
  (props, ref) => <PieChart ref={ref} {...props} donut />,
);
DonutChart.displayName = "DonutChart";

export interface RadarChartProps {
  /** Array of data rows; each row is a record keyed by `angleKey` plus each `dataKeys` entry. */
  data: Record<string, unknown>[];
  /** Keys within each row used as series (one radar polygon per key). */
  dataKeys: string[];
  /** Key within each row used for the radial axis label. @default "subject" */
  angleKey?: string;
  /** Chart title rendered above the plot. */
  title?: ReactNode;
  /** Secondary description rendered under the title. */
  description?: ReactNode;
  /** Plot height in pixels. */
  height?: number;
  /** Additional CSS classes merged onto the chart wrapper. */
  className?: string;
  /** Palette for series colors. Cycles if there are more series than colors. */
  colors?: string[];
}

export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  ({ data, dataKeys, angleKey = "subject", colors = COLORS, ...rest }, ref) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    return (
      <ChartWrapper ref={ref} {...rest} dataTable={buildTable(data, dataKeys, angleKey)}>
        <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="80%" role="img" aria-label={typeof rest.title === "string" ? rest.title : "Radar chart"}>
          <PolarGrid />
          <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 12 }} />
          <PolarRadiusAxis tick={{ fontSize: 10 }} />
          {dataKeys.map((key, i) => (
            <Radar key={key} dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} isAnimationActive={animated} />
          ))}
          <Tooltip />
          <Legend />
        </ReRadarChart>
      </ChartWrapper>
    );
  },
);
RadarChart.displayName = "RadarChart";
