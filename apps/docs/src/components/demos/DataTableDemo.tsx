"use client";

import dynamic from "next/dynamic";

const DataTableDemoInner = dynamic(() => import("./DataTableDemoInner"), {
  ssr: false,
  loading: () => <div style={{ blockSize: 320, inlineSize: "100%" }} className="wui-skeleton" />,
});

export function DataTableDemo() {
  return <DataTableDemoInner />;
}
