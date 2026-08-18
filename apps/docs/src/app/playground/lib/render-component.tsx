"use client";
import { lazy, Suspense, createElement, type ReactNode } from "react";
import * as Main from "civaria";
import { Spinner } from "civaria";

const heavyLazy: Record<string, ReturnType<typeof lazy>> = {
  Editor: lazy(() =>
    import("civaria/editor").then((m) => ({ default: m.Editor as any })),
  ),
  DataTable: lazy(() =>
    import("civaria/data-table").then((m) => ({ default: m.DataTable as any })),
  ),
  BarChart: lazy(() =>
    import("civaria/chart").then((m) => ({ default: m.BarChart as any })),
  ),
  LineChart: lazy(() =>
    import("civaria/chart").then((m) => ({ default: m.LineChart as any })),
  ),
  AreaChart: lazy(() =>
    import("civaria/chart").then((m) => ({ default: m.AreaChart as any })),
  ),
  PieChart: lazy(() =>
    import("civaria/chart").then((m) => ({ default: m.PieChart as any })),
  ),
  DonutChart: lazy(() =>
    import("civaria/chart").then((m) => ({ default: m.DonutChart as any })),
  ),
  RadarChart: lazy(() =>
    import("civaria/chart").then((m) => ({ default: m.RadarChart as any })),
  ),
};

export function renderComponent(
  name: string,
  props: Record<string, unknown>,
): ReactNode {
  if (name in heavyLazy) {
    const Heavy = heavyLazy[name]!;
    return (
      <Suspense fallback={<Spinner />}>
        {createElement(Heavy as any, props as any)}
      </Suspense>
    );
  }
  const Comp = (Main as any)[name];
  if (!Comp) return <div role="alert">Unknown component: {name}</div>;
  return createElement(Comp, props);
}
