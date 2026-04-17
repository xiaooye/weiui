"use client";

import { useState } from "react";
import { Slider } from "@weiui/react";

export function SliderDemo() {
  const [volume, setVolume] = useState(40);
  const [price, setPrice] = useState(100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-5)", width: "100%", maxWidth: "360px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)" }}>
          <span style={{ color: "var(--wui-color-muted-foreground)" }}>Volume</span>
          <strong>{volume}</strong>
        </div>
        <Slider value={volume} onChange={setVolume} label="Volume" />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)" }}>
          <span style={{ color: "var(--wui-color-muted-foreground)" }}>Max price</span>
          <strong>${price}</strong>
        </div>
        <Slider min={0} max={500} step={10} value={price} onChange={setPrice} label="Max price" />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)" }}>
          <span style={{ color: "var(--wui-color-muted-foreground)" }}>Disabled</span>
          <strong>60</strong>
        </div>
        <Slider defaultValue={60} disabled label="Disabled slider" />
      </div>
    </div>
  );
}
