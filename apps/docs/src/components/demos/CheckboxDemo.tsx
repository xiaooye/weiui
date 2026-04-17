"use client";

import { useState } from "react";
import { Checkbox } from "@weiui/react";

export function CheckboxDemo() {
  const [checked, setChecked] = useState(true);
  const items = ["Apples", "Bananas", "Cherries"];
  const [selected, setSelected] = useState<string[]>(["Apples"]);

  const allChecked = selected.length === items.length;
  const someChecked = selected.length > 0 && !allChecked;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-3)",
      }}
    >
      <Checkbox
        label={`Accept terms (${checked ? "checked" : "unchecked"})`}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <Checkbox label="Disabled" disabled />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--wui-spacing-2)",
          paddingInlineStart: "var(--wui-spacing-2)",
          borderInlineStart: "2px solid var(--wui-color-border)",
        }}
      >
        <Checkbox
          label="Select all"
          checked={allChecked}
          indeterminate={someChecked}
          onChange={(e) => setSelected(e.target.checked ? items : [])}
        />
        {items.map((item) => (
          <Checkbox
            key={item}
            label={item}
            checked={selected.includes(item)}
            onChange={(e) =>
              setSelected((s) =>
                e.target.checked ? [...s, item] : s.filter((x) => x !== item),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
