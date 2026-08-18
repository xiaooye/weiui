"use client";

import { useState } from "react";
import { Slider } from "civaria";

export function SliderDemo() {
  const [volume, setVolume] = useState(40);
  const [price, setPrice] = useState(100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--civ-spacing-5)", width: "100%", maxWidth: "360px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockEnd: "var(--civ-spacing-2)", fontSize: "var(--civ-font-size-sm)" }}>
          <span style={{ color: "var(--civ-color-muted-foreground)" }}>Volume</span>
          <strong>{volume}</strong>
        </div>
        <Slider value={volume} onChange={setVolume} label="Volume" />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockEnd: "var(--civ-spacing-2)", fontSize: "var(--civ-font-size-sm)" }}>
          <span style={{ color: "var(--civ-color-muted-foreground)" }}>Max price</span>
          <strong>${price}</strong>
        </div>
        <Slider min={0} max={500} step={10} value={price} onChange={setPrice} label="Max price" />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockEnd: "var(--civ-spacing-2)", fontSize: "var(--civ-font-size-sm)" }}>
          <span style={{ color: "var(--civ-color-muted-foreground)" }}>Disabled</span>
          <strong>60</strong>
        </div>
        <Slider defaultValue={60} disabled label="Disabled slider" />
      </div>
    </div>
  );
}
