"use client";

import { useState } from "react";
import { InputNumber } from "@weiui/react";

export function InputNumberCurrencyDemo() {
  const [value, setValue] = useState(1234);
  return (
    <InputNumber
      value={value}
      onChange={setValue}
      formatOptions={{ style: "currency", currency: "USD" }}
    />
  );
}
