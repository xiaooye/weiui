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
  Brush,
} from "recharts";
import { cn } from "../../utils/cn";
import { VisuallyHidden } from "../VisuallyHidden";
import { EmptyState } from "../EmptyState";

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

/** Axis tick / grid stroke tokens — threaded into Recharts so dark mode flips with the theme. */
const AXIS_TICK_STYLE = { fill: "var(--wui-color-muted-foreground)", fontSize: 12 };
const GRID_STROKE = "var(--wui-color-border)";
const BRUSH_STROKE = "var(--wui-color-primary)";

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

/** Formatter used by Recharts tick / tooltip APIs. */
export type AxisFormatter = (value: unknown) => string;

/**
 * Custom legend / tooltip pattern
 * --------------------------------
 * All chart components accept `legend` and `tooltip` slots. Pass a Recharts
 * `<Legend content={...} />` or `<Tooltip content={...} />` to fully replace
 * the default UI — useful when you need branded tooltips or a filterable
 * legend. If `legend`/`tooltip` is `null`, the slot is omitted entirely.
 *
 * @example
 *   import { Legend, Tooltip } from "recharts";
 *   <BarChart
 *     data={data}
 *     dataKeys={["sales"]}
 *     legend={<Legend verticalAlign="top" iconType="circle" />}
 *     tooltip={<Tooltip cursor={{ fill: "var(--wui-color-muted)" }} />}
 *   />
 */
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
  /** When true, stacks all series under a shared `stackId`. Pass a string to supply a custom stack id. */
  stacked?: boolean | string;
  /** Formatter applied to x-axis ticks. */
  xAxisFormatter?: AxisFormatter;
  /** Formatter applied to y-axis ticks and tooltip values. */
  yAxisFormatter?: AxisFormatter;
  /** Render a Recharts Brush under the plot for zoom / pan. */
  showBrush?: boolean;
  /** Node rendered when `data` is empty. Defaults to `<EmptyState title="No data" ... />`. */
  emptyState?: ReactNode;
  /** Replace the default tooltip. Pass `null` to remove it. */
  tooltip?: ReactNode;
  /** Replace the default legend. Pass `null` to remove it. */
  legend?: ReactNode;
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

/** Coerce `stacked` prop to a concrete stackId string, or undefined when disabled. */
function resolveStackId(stacked: boolean | string | undefined): string | undefined {
  if (!stacked) return undefined;
  return typeof stacked === "string" ? stacked : "stack-1";
}

interface EmptyShellProps {
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  emptyState?: ReactNode;
  defaultTitle: string;
  defaultDescription: string;
}

const EmptyShell = forwardRef<HTMLDivElement, EmptyShellProps>(
  ({ title, description, className, emptyState, defaultTitle, defaultDescription }, ref) => (
    <div ref={ref} className={cn("wui-chart", className)}>
      {title && <div className="wui-chart__title">{title}</div>}
      {description && <div className="wui-chart__description">{description}</div>}
      {emptyState ?? <EmptyState title={defaultTitle} description={defaultDescription} />}
    </div>
  ),
);
EmptyShell.displayName = "ChartEmptyShell";

/** Tooltip / legend defaults respect `null` opt-out while allowing user slots. */
function resolveTooltip(tooltip: ReactNode, yFormatter?: AxisFormatter): ReactNode {
  if (tooltip === null) return null;
  if (tooltip !== undefined) return tooltip;
  return yFormatter ? <Tooltip formatter={(value) => yFormatter(value)} /> : <Tooltip />;
}

function resolveLegend(legend: ReactNode): ReactNode {
  if (legend === null) return null;
  if (legend !== undefined) return legend;
  return <Legend />;
}

/**
 * Bar chart with stacked / brush / axis-formatter / empty-state / token-themed axes.
 *
 * @see {@link ChartProps} for custom legend / tooltip slot examples.
 */
export const BarChart = forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      data,
      dataKeys,
      xKey = "name",
      colors = COLORS,
      stacked,
      xAxisFormatter,
      yAxisFormatter,
      showBrush,
      emptyState,
      tooltip,
      legend,
      ...rest
    },
    ref,
  ) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    const stackId = resolveStackId(stacked);
    if (!data || data.length === 0) {
      return (
        <EmptyShell
          ref={ref}
          {...rest}
          emptyState={emptyState}
          defaultTitle="No data"
          defaultDescription="There is nothing to display in this chart yet."
        />
      );
    }
    return (
      <ChartWrapper ref={ref} {...rest} dataTable={buildTable(data, dataKeys, xKey)}>
        <ReBarChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Bar chart"}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey={xKey} tick={AXIS_TICK_STYLE} stroke={GRID_STROKE} tickFormatter={xAxisFormatter} />
          <YAxis tick={AXIS_TICK_STYLE} stroke={GRID_STROKE} tickFormatter={yAxisFormatter} />
          {resolveTooltip(tooltip, yAxisFormatter)}
          {resolveLegend(legend)}
          {dataKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
              isAnimationActive={animated}
              stackId={stackId}
            />
          ))}
          {showBrush && <Brush dataKey={xKey} height={24} stroke={BRUSH_STROKE} travellerWidth={8} />}
        </ReBarChart>
      </ChartWrapper>
    );
  },
);
BarChart.displayName = "BarChart";

/**
 * Line chart with brush / axis-formatter / empty-state / token-themed axes.
 *
 * @see {@link ChartProps} for custom legend / tooltip slot examples.
 */
export const LineChart = forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      data,
      dataKeys,
      xKey = "name",
      colors = COLORS,
      xAxisFormatter,
      yAxisFormatter,
      showBrush,
      emptyState,
      tooltip,
      legend,
      ...rest
    },
    ref,
  ) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    if (!data || data.length === 0) {
      return (
        <EmptyShell
          ref={ref}
          {...rest}
          emptyState={emptyState}
          defaultTitle="No data"
          defaultDescription="There is nothing to display in this chart yet."
        />
      );
    }
    return (
      <ChartWrapper ref={ref} {...rest} dataTable={buildTable(data, dataKeys, xKey)}>
        <ReLineChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Line chart"}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey={xKey} tick={AXIS_TICK_STYLE} stroke={GRID_STROKE} tickFormatter={xAxisFormatter} />
          <YAxis tick={AXIS_TICK_STYLE} stroke={GRID_STROKE} tickFormatter={yAxisFormatter} />
          {resolveTooltip(tooltip, yAxisFormatter)}
          {resolveLegend(legend)}
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={animated}
            />
          ))}
          {showBrush && <Brush dataKey={xKey} height={24} stroke={BRUSH_STROKE} travellerWidth={8} />}
        </ReLineChart>
      </ChartWrapper>
    );
  },
);
LineChart.displayName = "LineChart";

/**
 * Area chart with stacked / brush / axis-formatter / empty-state / token-themed axes.
 *
 * @see {@link ChartProps} for custom legend / tooltip slot examples.
 */
export const AreaChart = forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      data,
      dataKeys,
      xKey = "name",
      colors = COLORS,
      stacked,
      xAxisFormatter,
      yAxisFormatter,
      showBrush,
      emptyState,
      tooltip,
      legend,
      ...rest
    },
    ref,
  ) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    const stackId = resolveStackId(stacked);
    if (!data || data.length === 0) {
      return (
        <EmptyShell
          ref={ref}
          {...rest}
          emptyState={emptyState}
          defaultTitle="No data"
          defaultDescription="There is nothing to display in this chart yet."
        />
      );
    }
    return (
      <ChartWrapper ref={ref} {...rest} dataTable={buildTable(data, dataKeys, xKey)}>
        <ReAreaChart data={data} role="img" aria-label={typeof rest.title === "string" ? rest.title : "Area chart"}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis dataKey={xKey} tick={AXIS_TICK_STYLE} stroke={GRID_STROKE} tickFormatter={xAxisFormatter} />
          <YAxis tick={AXIS_TICK_STYLE} stroke={GRID_STROKE} tickFormatter={yAxisFormatter} />
          {resolveTooltip(tooltip, yAxisFormatter)}
          {resolveLegend(legend)}
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.2}
              isAnimationActive={animated}
              stackId={stackId}
            />
          ))}
          {showBrush && <Brush dataKey={xKey} height={24} stroke={BRUSH_STROKE} travellerWidth={8} />}
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
  /** Node rendered when `data` is empty. */
  emptyState?: ReactNode;
  /** Replace the default tooltip. Pass `null` to remove it. */
  tooltip?: ReactNode;
  /** Replace the default legend. Pass `null` to remove it. */
  legend?: ReactNode;
  /** Formatter applied to tooltip values. */
  valueFormatter?: AxisFormatter;
}

/**
 * Pie chart with empty-state / token-themed defaults.
 *
 * @see {@link ChartProps} for custom legend / tooltip slot examples.
 */
export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  ({ data, colors = COLORS, donut, emptyState, tooltip, legend, valueFormatter, ...rest }, ref) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    if (!data || data.length === 0) {
      return (
        <EmptyShell
          ref={ref}
          {...rest}
          emptyState={emptyState}
          defaultTitle="No data"
          defaultDescription="There is nothing to display in this chart yet."
        />
      );
    }
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
          {resolveTooltip(tooltip, valueFormatter)}
          {resolveLegend(legend)}
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
  /** Node rendered when `data` is empty. */
  emptyState?: ReactNode;
  /** Replace the default tooltip. Pass `null` to remove it. */
  tooltip?: ReactNode;
  /** Replace the default legend. Pass `null` to remove it. */
  legend?: ReactNode;
}

/**
 * Radar chart with empty-state / token-themed defaults.
 *
 * @see {@link ChartProps} for custom legend / tooltip slot examples.
 */
export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  (
    { data, dataKeys, angleKey = "subject", colors = COLORS, emptyState, tooltip, legend, ...rest },
    ref,
  ) => {
    const reduced = usePrefersReducedMotion();
    const animated = !reduced;
    if (!data || data.length === 0) {
      return (
        <EmptyShell
          ref={ref}
          {...rest}
          emptyState={emptyState}
          defaultTitle="No data"
          defaultDescription="There is nothing to display in this chart yet."
        />
      );
    }
    return (
      <ChartWrapper ref={ref} {...rest} dataTable={buildTable(data, dataKeys, angleKey)}>
        <ReRadarChart data={data} cx="50%" cy="50%" outerRadius="80%" role="img" aria-label={typeof rest.title === "string" ? rest.title : "Radar chart"}>
          <PolarGrid stroke={GRID_STROKE} />
          <PolarAngleAxis dataKey={angleKey} tick={AXIS_TICK_STYLE} stroke={GRID_STROKE} />
          <PolarRadiusAxis tick={{ ...AXIS_TICK_STYLE, fontSize: 10 }} stroke={GRID_STROKE} />
          {dataKeys.map((key, i) => (
            <Radar key={key} dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.2} isAnimationActive={animated} />
          ))}
          {resolveTooltip(tooltip)}
          {resolveLegend(legend)}
        </ReRadarChart>
      </ChartWrapper>
    );
  },
);
RadarChart.displayName = "RadarChart";
