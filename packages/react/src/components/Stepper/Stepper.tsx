"use client";
import { createContext, useContext, forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

interface StepperContextValue {
  activeStep: number;
}

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepperContext(): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error("Step components must be used within <Stepper>");
  return ctx;
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ activeStep, orientation = "horizontal", className, children, ...props }, ref) => (
    <StepperContext.Provider value={{ activeStep }}>
      <div
        ref={ref}
        className={cn("wui-stepper", orientation === "vertical" && "wui-stepper--vertical", className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  ),
);
Stepper.displayName = "Stepper";

export interface StepProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
  label: ReactNode;
  description?: ReactNode;
}

export const Step = forwardRef<HTMLDivElement, StepProps>(
  ({ index, label, description, className, children, ...props }, ref) => {
    const { activeStep } = useStepperContext();
    const isActive = index === activeStep;
    const isCompleted = index < activeStep;

    return (
      <div
        ref={ref}
        className={cn("wui-step", className)}
        data-active={isActive ? "" : undefined}
        data-completed={isCompleted ? "" : undefined}
        aria-current={isActive ? "step" : undefined}
        {...props}
      >
        <div className="wui-step__indicator">{isCompleted ? "✓" : index + 1}</div>
        <div>
          <div className="wui-step__label">{label}</div>
          {description && <div className="wui-step__description">{description}</div>}
        </div>
        {children}
      </div>
    );
  },
);
Step.displayName = "Step";

export interface StepSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
}

export const StepSeparator = forwardRef<HTMLDivElement, StepSeparatorProps>(
  ({ index, className, ...props }, ref) => {
    const { activeStep } = useStepperContext();
    const isCompleted = index < activeStep;

    return (
      <div
        ref={ref}
        className={cn("wui-step__separator", className)}
        data-completed={isCompleted ? "" : undefined}
        aria-hidden="true"
        {...props}
      />
    );
  },
);
StepSeparator.displayName = "StepSeparator";
