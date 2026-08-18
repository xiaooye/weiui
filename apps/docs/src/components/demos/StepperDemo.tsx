"use client";

import { useState } from "react";
import { Button, Step, StepSeparator, Stepper } from "civaria";

export function StepperDemo() {
  const [active, setActive] = useState(1);
  const totalSteps = 3;
  const isComplete = active >= totalSteps;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--civ-spacing-4)",
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
      <div style={{ display: "flex", gap: "var(--civ-spacing-2)", alignItems: "center" }}>
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
          onClick={() => setActive((s) => Math.min(totalSteps, s + 1))}
          disabled={isComplete}
        >
          {isComplete ? "Done" : active === totalSteps - 1 ? "Finish" : "Next"}
        </Button>
        {isComplete && (
          <span style={{ fontSize: "var(--civ-font-size-sm)", color: "var(--civ-color-success)" }}>
            All steps complete
          </span>
        )}
      </div>
    </div>
  );
}
