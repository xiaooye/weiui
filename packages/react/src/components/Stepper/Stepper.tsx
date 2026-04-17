"use client";
import {
  createContext,
  useContext,
  forwardRef,
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
  type ReactElement,
} from "react";
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

// Auto-inject `index` into <Step> and <StepSeparator> children when the
// consumer hasn't set one explicitly. Index = position in the Step
// sequence (StepSeparators share the index of the preceding Step).
function injectIndices(children: ReactNode): ReactNode {
  let stepIdx = 0;
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ index?: number; __wuiStep?: boolean; __wuiSep?: boolean }>;
    const type = el.type as { __wuiStep?: boolean; __wuiSep?: boolean };
    if (type?.__wuiStep) {
      const currentIdx = el.props.index ?? stepIdx;
      stepIdx += 1;
      if (el.props.index === undefined) {
        return cloneElement(el, { index: currentIdx });
      }
      return el;
    }
    if (type?.__wuiSep) {
      // Separator sits between step N and N+1; use index N-1 (preceding step).
      const sepIdx = el.props.index ?? Math.max(0, stepIdx - 1);
      if (el.props.index === undefined) {
        return cloneElement(el, { index: sepIdx });
      }
      return el;
    }
    return el;
  });
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  ({ activeStep, orientation = "horizontal", className, children, ...props }, ref) => (
    <StepperContext.Provider value={{ activeStep }}>
      <div
        ref={ref}
        className={cn("wui-stepper", orientation === "vertical" && "wui-stepper--vertical", className)}
        {...props}
      >
        {injectIndices(children)}
      </div>
    </StepperContext.Provider>
  ),
);
Stepper.displayName = "Stepper";

export interface StepProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional explicit index. Omit to let Stepper auto-infer from child order. */
  index?: number;
  label: ReactNode;
  description?: ReactNode;
}

type StepComponent = ReturnType<typeof forwardRef<HTMLDivElement, StepProps>> & {
  __wuiStep?: boolean;
};

export const Step: StepComponent = forwardRef<HTMLDivElement, StepProps>(
  ({ index = 0, label, description, className, children, ...props }, ref) => {
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
        <div className="wui-step__indicator">{isCompleted ? "\u2713" : index + 1}</div>
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
Step.__wuiStep = true;

export interface StepSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional explicit index. Omit to let Stepper auto-infer. */
  index?: number;
}

type StepSeparatorComponent = ReturnType<typeof forwardRef<HTMLDivElement, StepSeparatorProps>> & {
  __wuiSep?: boolean;
};

export const StepSeparator: StepSeparatorComponent = forwardRef<HTMLDivElement, StepSeparatorProps>(
  ({ index = 0, className, ...props }, ref) => {
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
StepSeparator.__wuiSep = true;
