import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field, FieldLabel, FieldDescription, FieldControl } from "../Field";

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
});
