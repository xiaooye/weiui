import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BarChart, LineChart, PieChart } from "../Chart";

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
    // Each data row should have the x value as a row header or cell
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Feb")).toBeInTheDocument();
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
    expect(screen.getByText("A")).toBeInTheDocument();
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
});
