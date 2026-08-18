"use client";

import dynamic from "next/dynamic";

const EditorDemoInner = dynamic(() => import("./EditorDemoInner"), {
  ssr: false,
  loading: () => <div style={{ blockSize: 280, inlineSize: "100%" }} className="civ-skeleton" />,
});

export function EditorDemo() {
  return <EditorDemoInner />;
}
