"use client";

import { useState } from "react";
import { Slider } from "@weiui/react";

export function SliderRangeDemo() {
  const [priceRange, setPriceRange] = useState<[number, number]>([40, 160]);
  const [timeRange, setTimeRange] = useState<[number, number]>([9, 17]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-5)", width: "100%", maxWidth: "360px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)" }}>
          <span style={{ color: "var(--wui-color-muted-foreground)" }}>Price range</span>
          <strong>${priceRange[0]} – ${priceRange[1]}</strong>
        </div>
        <Slider
          mode="range"
          min={0}
          max={200}
          step={5}
          value={priceRange}
          onRangeChange={setPriceRange}
          label="Price range"
          showTooltip
          formatTooltip={(v) => `$${v}`}
        />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBlockEnd: "var(--wui-spacing-2)", fontSize: "var(--wui-font-size-sm)" }}>
          <span style={{ color: "var(--wui-color-muted-foreground)" }}>Availability</span>
          <strong>{timeRange[0]}:00 – {timeRange[1]}:00</strong>
        </div>
        <Slider
          mode="range"
          min={0}
          max={24}
          step={1}
          value={timeRange}
          onRangeChange={setTimeRange}
          label="Availability"
          showTooltip
          formatTooltip={(v) => `${v}:00`}
        />
      </div>
    </div>
  );
}
