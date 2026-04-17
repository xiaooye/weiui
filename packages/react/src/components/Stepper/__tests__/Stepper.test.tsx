import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stepper, Step, StepSeparator } from "../Stepper";

describe("Stepper", () => {
  it("renders each step label", () => {
    render(
      <Stepper activeStep={0}>
        <Step label="One" />
        <Step label="Two" />
      </Stepper>,
    );
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });

  it("applies vertical orientation class", () => {
    render(
      <Stepper activeStep={0} orientation="vertical" data-testid="stepper">
        <Step label="One" />
      </Stepper>,
    );
    expect(screen.getByTestId("stepper").className).toContain("wui-stepper--vertical");
  });

  describe("auto step index (P0)", () => {
    it("numbers steps automatically when index is omitted", () => {
      render(
        <Stepper activeStep={0}>
          <Step label="Step one" />
          <Step label="Step two" />
          <Step label="Step three" />
        </Stepper>,
      );
      // Indicators should show 1, 2, 3 in order
      const stepOne = screen.getByText("Step one").closest(".wui-step");
      const stepTwo = screen.getByText("Step two").closest(".wui-step");
      const stepThree = screen.getByText("Step three").closest(".wui-step");
      expect(stepOne?.querySelector(".wui-step__indicator")?.textContent).toBe("1");
      expect(stepTwo?.querySelector(".wui-step__indicator")?.textContent).toBe("2");
      expect(stepThree?.querySelector(".wui-step__indicator")?.textContent).toBe("3");
    });

    it("sets aria-current=step on the active step (index 1)", () => {
      render(
        <Stepper activeStep={1}>
          <Step label="A" />
          <Step label="B" />
          <Step label="C" />
        </Stepper>,
      );
      const b = screen.getByText("B").closest(".wui-step");
      expect(b).toHaveAttribute("aria-current", "step");
    });

    it("marks previous steps completed (checkmark indicator)", () => {
      render(
        <Stepper activeStep={2}>
          <Step label="A" />
          <Step label="B" />
          <Step label="C" />
        </Stepper>,
      );
      const a = screen.getByText("A").closest(".wui-step");
      const b = screen.getByText("B").closest(".wui-step");
      expect(a).toHaveAttribute("data-completed", "");
      expect(b).toHaveAttribute("data-completed", "");
      expect(a?.querySelector(".wui-step__indicator")?.textContent).toBe("\u2713");
    });

    it("honours explicit index when provided", () => {
      render(
        <Stepper activeStep={5}>
          <Step label="A" index={5} />
        </Stepper>,
      );
      const a = screen.getByText("A").closest(".wui-step");
      expect(a).toHaveAttribute("aria-current", "step");
    });

    it("separators work without explicit index", () => {
      render(
        <Stepper activeStep={1}>
          <Step label="A" />
          <StepSeparator data-testid="sep-1" />
          <Step label="B" />
        </Stepper>,
      );
      // Separator between step 0 and step 1 should be data-completed when activeStep > 0.
      expect(screen.getByTestId("sep-1")).toHaveAttribute("data-completed", "");
    });
  });
});
