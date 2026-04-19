import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ControlString, ControlNumber, ControlBool, ControlEnum } from "../";
import { inferControl } from "../infer-control";

describe("prop-controls", () => {
  it("ControlString renders label + input and emits onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlString label="Label" value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("ControlNumber emits numbers", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlNumber label="Count" value={0} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    await user.type(input, "4");
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("ControlBool emits boolean", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlBool label="Disabled" value={false} onChange={onChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("ControlEnum exposes options and emits selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlEnum
        label="Variant"
        value="solid"
        options={["solid", "outline", "ghost"]}
        onChange={onChange}
      />,
    );
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "outline");
    expect(onChange).toHaveBeenLastCalledWith("outline");
  });
});

describe("inferControl", () => {
  it("picks ControlEnum for string literal union types", () => {
    expect(inferControl({ name: "v", type: '"a" | "b" | "c"', description: "" })).toBe("enum");
  });
  it("picks ControlNumber for number", () => {
    expect(inferControl({ name: "n", type: "number", description: "" })).toBe("number");
  });
  it("picks ControlBool for boolean", () => {
    expect(inferControl({ name: "b", type: "boolean", description: "" })).toBe("bool");
  });
  it("picks ControlString for string", () => {
    expect(inferControl({ name: "s", type: "string", description: "" })).toBe("string");
  });
  it("picks ControlReactNode for ReactNode in type", () => {
    expect(inferControl({ name: "c", type: "ReactNode", description: "" })).toBe("reactnode");
  });
  it("picks ControlObject for Record/object", () => {
    expect(inferControl({ name: "o", type: "Record<string, unknown>", description: "" })).toBe("object");
  });
});
