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
    expect(radios[0]!.name).toBe(radios[1]!.name);
    expect(radios[0]!.name).toBeTruthy();
  });

  it("applies styled visual class (wui-radio__input)", () => {
    render(
      <RadioGroup aria-label="styled">
        <RadioGroupItem value="a" label="A" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toHaveClass("wui-radio__input");
  });

  it("arrow-down moves focus + selection to next item", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="keys" defaultValue="a">
        <RadioGroupItem value="a" label="A" />
        <RadioGroupItem value="b" label="B" />
        <RadioGroupItem value="c" label="C" />
      </RadioGroup>,
    );
    const radioA = screen.getByLabelText("A");
    radioA.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByLabelText("B")).toBeChecked();
    expect(screen.getByLabelText("B")).toHaveFocus();
  });

  it("arrow-up moves focus + selection to previous item", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="keys" defaultValue="b">
        <RadioGroupItem value="a" label="A" />
        <RadioGroupItem value="b" label="B" />
      </RadioGroup>,
    );
    screen.getByLabelText("B").focus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByLabelText("A")).toBeChecked();
    expect(screen.getByLabelText("A")).toHaveFocus();
  });

  it("arrow keys wrap from last to first and first to last", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="wrap" defaultValue="b">
        <RadioGroupItem value="a" label="A" />
        <RadioGroupItem value="b" label="B" />
      </RadioGroup>,
    );
    screen.getByLabelText("B").focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByLabelText("A")).toBeChecked();

    screen.getByLabelText("A").focus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByLabelText("B")).toBeChecked();
  });

  it("applies vertical orientation class and data attribute", () => {
    render(
      <RadioGroup aria-label="opts" orientation="vertical">
        <RadioGroupItem value="a" label="A" />
      </RadioGroup>,
    );
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveClass("wui-radio-group--vertical");
    expect(group).toHaveAttribute("data-orientation", "vertical");
  });

  it("renders item description and wires aria-describedby", () => {
    render(
      <RadioGroup aria-label="opts">
        <RadioGroupItem value="a" label="Plan A" description="Best for small teams" />
      </RadioGroup>,
    );
    const desc = screen.getByText("Best for small teams");
    expect(desc).toBeInTheDocument();
    const radio = screen.getByRole("radio");
    expect(radio).toHaveAttribute("aria-describedby", desc.id);
  });
});
