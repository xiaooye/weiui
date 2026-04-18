import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field, FieldLabel, FieldDescription, FieldControl } from "../Field";
import { Input } from "../../Input";
import { Textarea } from "../../Textarea";

describe("Field", () => {
  it("renders children", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <input />
      </Field>,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("FieldLabel htmlFor points to the field input ID", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldControl>
          <input />
        </FieldControl>
      </Field>,
    );
    const label = screen.getByText("Email").closest("label")!;
    expect(label.getAttribute("for")).toBeTruthy();
    expect(label.getAttribute("for")).toContain("field");
  });

  it("error message renders with role='alert'", () => {
    render(
      <Field error="This field is required">
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("This field is required");
  });

  it("no error message when error is not provided", () => {
    render(
      <Field>
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("required field shows indicator in FieldLabel", () => {
    render(
      <Field required>
        <FieldLabel>Email</FieldLabel>
      </Field>,
    );
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveAttribute("aria-hidden", "true");
  });

  it("FieldDescription renders with an id", () => {
    render(
      <Field>
        <FieldDescription>Enter your email</FieldDescription>
      </Field>,
    );
    const desc = screen.getByText("Enter your email");
    expect(desc.getAttribute("id")).toBeTruthy();
    expect(desc.getAttribute("id")).toContain("field");
  });

  it("FieldControl sets data-invalid when error is present", () => {
    render(
      <Field error="Error">
        <FieldControl data-testid="control">
          <input />
        </FieldControl>
      </Field>,
    );
    const control = screen.getByTestId("control");
    expect(control).toHaveAttribute("data-invalid");
  });

  it("FieldControl does not set data-invalid when no error", () => {
    render(
      <Field>
        <FieldControl data-testid="control">
          <input />
        </FieldControl>
      </Field>,
    );
    const control = screen.getByTestId("control");
    expect(control).not.toHaveAttribute("data-invalid");
  });

  it("FieldControl auto-wires id and aria-describedby onto a single child input", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldDescription>Enter your email</FieldDescription>
        <FieldControl>
          <input data-testid="input" />
        </FieldControl>
      </Field>,
    );
    const input = screen.getByTestId("input");
    const label = screen.getByText("Email").closest("label")!;
    const desc = screen.getByText("Enter your email");

    expect(input.getAttribute("id")).toBeTruthy();
    expect(input.getAttribute("id")).toBe(label.getAttribute("for"));
    expect(input.getAttribute("aria-describedby")).toContain(desc.getAttribute("id"));
  });

  it("FieldControl auto-wires aria-invalid and error id when error is present", () => {
    render(
      <Field error="Required">
        <FieldLabel>Name</FieldLabel>
        <FieldControl>
          <input data-testid="input" />
        </FieldControl>
      </Field>,
    );
    const input = screen.getByTestId("input");
    const err = screen.getByRole("alert");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(err.getAttribute("id"));
  });

  it("FieldControl preserves a user-provided id on the child when set explicitly", () => {
    render(
      <Field>
        <FieldLabel>Custom</FieldLabel>
        <FieldControl>
          <input id="custom-id" data-testid="input" />
        </FieldControl>
      </Field>,
    );
    const input = screen.getByTestId("input");
    // User-provided id wins; consumers who set it are responsible for wiring the label.
    expect(input.getAttribute("id")).toBe("custom-id");
  });

  it("Input auto-wires to Field context when nested directly", () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldDescription>Enter your email</FieldDescription>
        <Input data-testid="input" />
      </Field>,
    );
    const input = screen.getByTestId("input");
    const label = screen.getByText("Email").closest("label")!;
    expect(input.getAttribute("id")).toBe(label.getAttribute("for"));
    expect(input.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("Input auto-wires aria-invalid when Field has error", () => {
    render(
      <Field error="Error">
        <FieldLabel>Email</FieldLabel>
        <Input data-testid="input" />
      </Field>,
    );
    const input = screen.getByTestId("input");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("Textarea auto-wires to Field context", () => {
    render(
      <Field>
        <FieldLabel>Bio</FieldLabel>
        <FieldDescription>Tell us about yourself</FieldDescription>
        <Textarea data-testid="ta" />
      </Field>,
    );
    const ta = screen.getByTestId("ta");
    const label = screen.getByText("Bio").closest("label")!;
    expect(ta.getAttribute("id")).toBe(label.getAttribute("for"));
    expect(ta.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("Input/Textarea explicit invalid prop still takes precedence", () => {
    render(
      <Field>
        <Input invalid data-testid="input" />
      </Field>,
    );
    expect(screen.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
  });

  // E.7 — success + validating + disabled propagation
  it("renders success message when success string is set and no error", () => {
    render(
      <Field success="Looks good">
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    expect(screen.getByText("Looks good")).toBeInTheDocument();
  });

  it("does not render success when error is present", () => {
    render(
      <Field error="Required" success="Looks good">
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    expect(screen.queryByText("Looks good")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("renders validating indicator when validating", () => {
    render(
      <Field validating>
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    expect(screen.getByText("Validating…")).toBeInTheDocument();
  });

  it("root has data-validating when validating", () => {
    const { container } = render(
      <Field validating data-testid="f">
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    const root = container.querySelector(".wui-field");
    expect(root).toHaveAttribute("data-validating");
  });

  it("root has data-success when success set and no error", () => {
    const { container } = render(
      <Field success="Ok">
        <FieldLabel>Name</FieldLabel>
      </Field>,
    );
    const root = container.querySelector(".wui-field");
    expect(root).toHaveAttribute("data-success");
  });

  it("propagates disabled to nested Input via context", () => {
    render(
      <Field disabled>
        <FieldLabel>Email</FieldLabel>
        <Input data-testid="input" />
      </Field>,
    );
    expect(screen.getByTestId("input")).toBeDisabled();
  });

  it("propagates disabled to nested Textarea", () => {
    render(
      <Field disabled>
        <FieldLabel>Bio</FieldLabel>
        <Textarea data-testid="ta" />
      </Field>,
    );
    expect(screen.getByTestId("ta")).toBeDisabled();
  });

  it("explicit disabled on input still wins", () => {
    render(
      <Field>
        <Input disabled={false} data-testid="input" />
      </Field>,
    );
    expect(screen.getByTestId("input")).not.toBeDisabled();
  });

  it("FieldControl propagates disabled to the child via clone", () => {
    render(
      <Field disabled>
        <FieldControl>
          <input data-testid="input" />
        </FieldControl>
      </Field>,
    );
    expect(screen.getByTestId("input")).toBeDisabled();
  });

  it("FieldControl sets data-disabled when field is disabled", () => {
    render(
      <Field disabled>
        <FieldControl data-testid="ctrl">
          <input />
        </FieldControl>
      </Field>,
    );
    expect(screen.getByTestId("ctrl")).toHaveAttribute("data-disabled");
  });

  it("aria-describedby includes success id when success is set", () => {
    render(
      <Field success="Great">
        <FieldLabel>Name</FieldLabel>
        <Input data-testid="input" />
      </Field>,
    );
    const input = screen.getByTestId("input");
    const success = screen.getByText("Great");
    expect(input.getAttribute("aria-describedby")).toContain(success.getAttribute("id"));
  });
});
