"use client";

import { useState } from "react";
import { Button, Step, StepSeparator, Stepper } from "@weiui/react";

export function StepperDemo() {
  const [active, setActive] = useState(1);
  const total = 3;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--wui-spacing-4)",
        width: "100%",
      }}
    >
      <Stepper activeStep={active}>
        <Step label="Account" description="Create your account" />
        <StepSeparator />
        <Step label="Profile" description="Fill in details" />
        <StepSeparator />
        <Step label="Review" description="Confirm setup" />
      </Stepper>
      <div style={{ display: "flex", gap: "var(--wui-spacing-2)" }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActive((s) => Math.max(0, s - 1))}
          disabled={active === 0}
        >
          Back
        </Button>
        <Button
          size="sm"
          onClick={() => setActive((s) => Math.min(total, s + 1))}
          disabled={active === total}
        >
          {active === total - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
