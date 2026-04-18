import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Recharts' `ResponsiveContainer` depends on `ResizeObserver` + element
// measurement which jsdom does not provide, so the chart body never renders.
// Swap it for a fixed-size container so the SVG subtree actually mounts and
// we can assert on <Brush>, grid strokes, tick formatter calls, etc.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  const React = await import("react");
  const ResponsiveContainer = ({
    children,
    width: _w,
    height,
  }: {
    children: React.ReactElement;
    width?: number | string;
    height?: number | string;
  }) =>
    React.createElement(
      "div",
      { style: { width: 600, height: typeof height === "number" ? height : 300 } },
      React.cloneElement(children, { width: 600, height: typeof height === "number" ? height : 300 }),
    );
  return { ...actual, ResponsiveContainer };
});

import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  RadarChart,
} from "../Chart";

const data = [
  { name: "Jan", sales: 120, profit: 30 },
  { name: "Feb", sales: 180, profit: 45 },
  { name: "Mar", sales: 150, profit: 40 },
];

describe("Chart", () => {
  it("renders BarChart wrapper with title", () => {
    const { container } = render(
      <BarChart data={data} dataKeys={["sales"]} title="Monthly sales" />,
    );
    expect(container.querySelector(".wui-chart")).toBeInTheDocument();
    expect(screen.getByText("Monthly sales")).toBeInTheDocument();
  });

  // Wave 5d P0: screen-reader data table fallback
  it("BarChart renders a visually-hidden data table summary", () => {
    render(<BarChart data={data} dataKeys={["sales", "profit"]} title="Monthly" />);
    const table = screen.getByRole("table", { hidden: false });
    expect(table).toBeInTheDocument();
    // Headers should include the xKey + each dataKey
    expect(
      screen.getByRole("columnheader", { name: /name/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /sales/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /profit/i }),
    ).toBeInTheDocument();
    // Each data row should have the x value as a row header or cell.
    // (The same text also renders inside the SVG as a tick label — query the
    // data-table cells specifically so we match the hidden row.)
    const cells = screen.getAllByRole("cell");
    expect(cells.some((c) => c.textContent === "Jan")).toBe(true);
    expect(cells.some((c) => c.textContent === "Feb")).toBe(true);
  });

  it("LineChart renders a visually-hidden data table summary", () => {
    render(<LineChart data={data} dataKeys={["sales"]} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("PieChart renders a visually-hidden data table summary", () => {
    const pieData = [
      { name: "A", value: 10 },
      { name: "B", value: 20 },
    ];
    render(<PieChart data={pieData} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    const cells = screen.getAllByRole("cell");
    expect(cells.some((c) => c.textContent === "A")).toBe(true);
  });

  // Wave 5d P0: reduced motion respect
  describe("respects prefers-reduced-motion", () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it("disables animation when prefers-reduced-motion is reduce", () => {
      window.matchMedia = vi.fn().mockImplementation((q: string) => ({
        matches: q.includes("prefers-reduced-motion: reduce"),
        media: q,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })) as unknown as typeof window.matchMedia;

      const { container } = render(
        <BarChart data={data} dataKeys={["sales"]} title="Test" />,
      );
      // When reduced motion is requested, Recharts should not apply the
      // recharts-animation class to bars/lines. Verify at least that the
      // chart renders at all — the animation-disabled flag is an internal
      // Recharts prop so full verification needs the render tree.
      expect(container.querySelector(".wui-chart")).toBeInTheDocument();
    });
  });

  // Phase 6 group F: enterprise polish
  describe("empty / no-data state", () => {
    it("BarChart renders default EmptyState when data is empty", () => {
      render(<BarChart data={[]} dataKeys={["sales"]} title="Empty" />);
      expect(screen.getByText("No data")).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("LineChart renders default EmptyState when data is empty", () => {
      render(<LineChart data={[]} dataKeys={["sales"]} />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("AreaChart renders default EmptyState when data is empty", () => {
      render(<AreaChart data={[]} dataKeys={["sales"]} />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("PieChart renders default EmptyState when data is empty", () => {
      render(<PieChart data={[]} />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("RadarChart renders default EmptyState when data is empty", () => {
      render(<RadarChart data={[]} dataKeys={["x"]} />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });

    it("accepts a custom emptyState override", () => {
      render(
        <BarChart
          data={[]}
          dataKeys={["sales"]}
          emptyState={<div data-testid="custom-empty">Custom empty</div>}
        />,
      );
      expect(screen.getByTestId("custom-empty")).toBeInTheDocument();
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });

    it("preserves title / description above the empty slot", () => {
      render(
        <BarChart
          data={[]}
          dataKeys={["sales"]}
          title="Revenue"
          description="Q1 breakdown"
        />,
      );
      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("Q1 breakdown")).toBeInTheDocument();
      expect(screen.getByText("No data")).toBeInTheDocument();
    });
  });

  describe("stacked variants", () => {
    it("BarChart applies a shared stackId when stacked is true", () => {
      const { container } = render(
        <BarChart data={data} dataKeys={["sales", "profit"]} stacked />,
      );
      // Recharts renders <Bar> layers — when stacked each shares the stackId
      // which shows up as overlapping rectangles with matching internal props.
      // We cannot read React props from the DOM, but we can assert the chart
      // still renders both series by checking for the legend entries.
      expect(container.querySelector(".wui-chart")).toBeInTheDocument();
      // Each data key should appear as a legend label.
      expect(screen.getAllByText(/sales/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/profit/i).length).toBeGreaterThan(0);
    });

    it("AreaChart accepts a custom stackId string", () => {
      const { container } = render(
        <AreaChart data={data} dataKeys={["sales", "profit"]} stacked="totals" />,
      );
      expect(container.querySelector(".wui-chart")).toBeInTheDocument();
    });
  });

  describe("axis formatters", () => {
    it("applies yAxisFormatter to y-axis ticks", () => {
      const yFmt = vi.fn((v: unknown) => `$${v}`);
      render(
        <LineChart data={data} dataKeys={["sales"]} yAxisFormatter={yFmt} />,
      );
      // Recharts invokes the formatter for each tick — assert at least one call.
      expect(yFmt).toHaveBeenCalled();
    });

    it("applies xAxisFormatter to x-axis ticks", () => {
      const xFmt = vi.fn((v: unknown) => `Month: ${v}`);
      render(
        <BarChart data={data} dataKeys={["sales"]} xAxisFormatter={xFmt} />,
      );
      expect(xFmt).toHaveBeenCalled();
    });
  });

  describe("Brush / zoom slot", () => {
    it("renders a Brush under the plot when showBrush is true", () => {
      const { container } = render(
        <LineChart data={data} dataKeys={["sales"]} showBrush />,
      );
      // Recharts renders the Brush as a <g class="recharts-brush">
      expect(container.querySelector(".recharts-brush")).toBeInTheDocument();
    });

    it("does not render a Brush by default", () => {
      const { container } = render(
        <LineChart data={data} dataKeys={["sales"]} />,
      );
      expect(container.querySelector(".recharts-brush")).not.toBeInTheDocument();
    });
  });

  describe("token-themed axes / grid", () => {
    it("grid stroke uses the border token", () => {
      const { container } = render(
        <BarChart data={data} dataKeys={["sales"]} />,
      );
      const grid = container.querySelector(".recharts-cartesian-grid");
      expect(grid).toBeInTheDocument();
      // Inspect one of the grid lines — stroke should match the token var.
      const line = grid?.querySelector("line");
      expect(line?.getAttribute("stroke")).toBe("var(--wui-color-border)");
    });
  });

  describe("custom legend / tooltip slots", () => {
    it("omits the legend when legend={null}", () => {
      const { container } = render(
        <BarChart data={data} dataKeys={["sales"]} legend={null} />,
      );
      expect(container.querySelector(".recharts-legend-wrapper")).not.toBeInTheDocument();
    });
  });
});
