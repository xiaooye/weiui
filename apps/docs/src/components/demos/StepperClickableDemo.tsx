"use client";

import { useState } from "react";
import { Step, StepSeparator, Stepper } from "@weiui/react";

export function StepperClickableDemo() {
  const [active, setActive] = useState(2);
  return (
    <Stepper activeStep={active} onStepClick={setActive}>
      <Step label="Plan" description="Pick a plan" />
      <StepSeparator />
      <Step label="Billing" description="Payment details" />
      <StepSeparator />
      <Step label="Review" description="Confirm &amp; pay" error />
      <StepSeparator />
      <Step label="Done" description="Receipt" />
    </Stepper>
  );
}
