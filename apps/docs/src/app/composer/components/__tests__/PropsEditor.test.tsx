import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropsEditor } from "../PropsEditor";
import { makeNode } from "../../lib/tree";
import type { ComponentSchema } from "../../../../lib/component-schema-loader";

const buttonSchema: ComponentSchema = {
  name: "Button",
  category: "Actions",
  description: "Button",
  importPath: "@weiui/react",
  subpathImport: null,
  dependencies: [],
  props: [
    {
      name: "children",
      type: "ReactNode",
      required: true,
      description: "Button content",
    },
    {
      name: "variant",
      type: '"solid" | "outline" | "ghost"',
      default: '"solid"',
      required: false,
      description: "Visual style",
    },
    {
      name: "disabled",
      type: "boolean",
      required: false,
      description: "Disable the button",
    },
  ],
  compound: [],
  examples: [],
  accessibility: [],
};

describe("PropsEditor", () => {
  it("shows the EmptyState when no node is selected", () => {
    render(
      <PropsEditor
        schema={null}
        node={null}
        onUpdateProps={() => {}}
        onUpdateText={() => {}}
      />,
    );
    expect(screen.getByText("No selection")).toBeInTheDocument();
  });

  it("renders the node type header and a text input for node.text", () => {
    const node = makeNode("Button", { variant: "solid" }, "Click me");
    render(
      <PropsEditor
        schema={buttonSchema}
        node={node}
        onUpdateProps={() => {}}
        onUpdateText={() => {}}
      />,
    );
    expect(screen.getByText("Button Props")).toBeInTheDocument();
    const text = screen.getByLabelText("text");
    expect(text).toHaveValue("Click me");
  });

  it("dispatches onUpdateText when the text input changes", async () => {
    const user = userEvent.setup();
    const onUpdateText = vi.fn();
    const node = makeNode("Button", {}, "Hello");
    render(
      <PropsEditor
        schema={buttonSchema}
        node={node}
        onUpdateProps={() => {}}
        onUpdateText={onUpdateText}
      />,
    );
    const text = screen.getByLabelText("text");
    await user.type(text, "!");
    expect(onUpdateText).toHaveBeenLastCalledWith("Hello!");
  });

  it("renders an enum control for union types + a bool control for boolean", () => {
    const node = makeNode("Button", { variant: "solid", disabled: false });
    render(
      <PropsEditor
        schema={buttonSchema}
        node={node}
        onUpdateProps={() => {}}
        onUpdateText={() => {}}
      />,
    );
    const variant = screen.getByLabelText("variant");
    expect(variant.tagName).toBe("SELECT");
    expect(variant).toHaveValue("solid");
    expect(screen.getByRole("switch", { name: /disabled/i })).toBeInTheDocument();
  });

  it("omits the children prop from the prop list (handled by text editor)", () => {
    const node = makeNode("Button", {});
    render(
      <PropsEditor
        schema={buttonSchema}
        node={node}
        onUpdateProps={() => {}}
        onUpdateText={() => {}}
      />,
    );
    // No label named exactly "children" should render alongside "text".
    expect(screen.queryByLabelText("children")).toBeNull();
  });

  it("dispatches onUpdateProps with merged props when a control changes", async () => {
    const user = userEvent.setup();
    const onUpdateProps = vi.fn();
    const node = makeNode("Button", { variant: "solid", disabled: false });
    render(
      <PropsEditor
        schema={buttonSchema}
        node={node}
        onUpdateProps={onUpdateProps}
        onUpdateText={() => {}}
      />,
    );
    await user.selectOptions(screen.getByLabelText("variant"), "outline");
    expect(onUpdateProps).toHaveBeenCalledWith({
      variant: "outline",
      disabled: false,
    });
  });

  it("falls back gracefully when schema is null (shows loading hint)", () => {
    const node = makeNode("Button", {}, "hi");
    render(
      <PropsEditor
        schema={null}
        node={node}
        onUpdateProps={() => {}}
        onUpdateText={() => {}}
      />,
    );
    expect(screen.getByText(/loading schema/i)).toBeInTheDocument();
    // The text field still renders regardless of schema.
    expect(screen.getByLabelText("text")).toHaveValue("hi");
  });
});
