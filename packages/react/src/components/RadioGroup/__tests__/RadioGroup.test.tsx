import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "../RadioGroup";

describe("RadioGroup", () => {
  it("has role='radiogroup'", () => {
    render(
      <RadioGroup aria-label="options">
        <RadioGroupItem value="a" label="A" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("renders radio items", () => {
    render(
      <RadioGroup aria-label="options">
        <RadioGroupItem value="a" label="Option A" />
        <RadioGroupItem value="b" label="Option B" />
      </RadioGroup>,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("selects item on click and deselects previous", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="pick one" defaultValue="a">
        <RadioGroupItem value="a" label="A" />
        <RadioGroupItem value="b" label="B" />
      </RadioGroup>,
    );
    const radioA = screen.getByLabelText("A");
    const radioB = screen.getByLabelText("B");

    expect(radioA).toBeChecked();
    await user.click(radioB);
    expect(radioB).toBeChecked();
    expect(radioA).not.toBeChecked();
  });

  it("calls onValueChange with the selected value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="pick one" onValueChange={onValueChange}>
        <RadioGroupItem value="x" label="X" />
        <RadioGroupItem value="y" label="Y" />
      </RadioGroup>,
    );
    await user.click(screen.getByLabelText("Y"));
    expect(onValueChange).toHaveBeenCalledWith("y");
  });

  it("supports controlled mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="controlled" value="a" onValueChange={onValueChange}>
        <RadioGroupItem value="a" label="A" />
        <RadioGroupItem value="b" label="B" />
      </RadioGroup>,
    );
    expect(screen.getByLabelText("A")).toBeChecked();
    await user.click(screen.getByLabelText("B"));
    // controlled — value stays at "a" but callback fires
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByLabelText("A")).toBeChecked();
  });

  it("labels are associated with radio inputs", () => {
    render(
      <RadioGroup aria-label="options">
        <RadioGroupItem value="a" label="Option A" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio");
    const label = screen.getByText("Option A");
    expect(label).toHaveAttribute("for", radio.id);
  });

  it("all items share the same name", () => {
    render(
      <RadioGroup aria-label="group">
        <RadioGroupItem value="a" label="A" />
        <RadioGroupItem value="b" label="B" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(radios[0].name).toBe(radios[1].name);
    expect(radios[0].name).toBeTruthy();
  });
});
