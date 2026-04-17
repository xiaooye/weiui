"use client";

import { useState } from "react";
import { InputOTP } from "@weiui/react";

export function InputOTP4Demo() {
  const [value, setValue] = useState("");
  return <InputOTP length={4} value={value} onChange={setValue} />;
}
