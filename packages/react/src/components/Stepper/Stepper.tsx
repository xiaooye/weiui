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
  onStepClick?: (index: number) => void;
}

const StepperContext = createContext<StepperContextValue | null>(null);

function useStepperContext(): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error("Step components must be used within <Stepper>");
  return ctx;
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  /** Zero-indexed active step. */
  activeStep: number;
  /** Stepper content — typically Step and StepSeparator components. */
  children: ReactNode;
  /** Layout orientation. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** When provided, Step indicators and labels become clickable to jump between steps. */
  onStepClick?: (index: number) => void;
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
  ({ activeStep, orientation = "horizontal", onStepClick, className, children, ...props }, ref) => (
    <StepperContext.Provider value={{ activeStep, onStepClick }}>
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
  /** Step label shown next to the indicator. */
  label: ReactNode;
  /** Secondary text shown below the label. */
  description?: ReactNode;
  /** Error state — renders an error indicator and description color. */
  error?: boolean;
  /** Custom icon to replace the numeric indicator. */
  icon?: ReactNode;
  /** Custom icon for the completed state (defaults to a checkmark). */
  completedIcon?: ReactNode;
  /** Custom icon for the error state (defaults to "!"). */
  errorIcon?: ReactNode;
}

type StepComponent = ReturnType<typeof forwardRef<HTMLDivElement, StepProps>> & {
  __wuiStep?: boolean;
};

export const Step: StepComponent = forwardRef<HTMLDivElement, StepProps>(
  (
    { index = 0, label, description, error, icon, completedIcon, errorIcon, className, children, onClick, ...props },
    ref,
  ) => {
    const { activeStep, onStepClick } = useStepperContext();
    const isActive = index === activeStep;
    const isCompleted = !error && index < activeStep;
    const clickable = !!onStepClick;

    const renderIndicatorContent = () => {
      if (error) return errorIcon ?? "!";
      if (isCompleted) return completedIcon ?? "\u2713";
      if (icon) return icon;
      return index + 1;
    };

    return (
      <div
        ref={ref}
        className={cn("wui-step", className)}
        data-active={isActive ? "" : undefined}
        data-completed={isCompleted ? "" : undefined}
        data-error={error ? "" : undefined}
        data-clickable={clickable ? "" : undefined}
        aria-current={isActive ? "step" : undefined}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={(e) => {
          if (clickable) onStepClick?.(index);
          onClick?.(e);
        }}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onStepClick?.(index);
                }
              }
            : undefined
        }
        {...props}
      >
        <div className="wui-step__indicator">{renderIndicatorContent()}</div>
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
