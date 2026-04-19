import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WysiwygCanvas } from "../../components/WysiwygCanvas";
import { makeNode } from "../tree";

describe("WysiwygCanvas", () => {
  it("mounts and wraps every node with a data-composer-id attribute", () => {
    const btn = makeNode("Button", { variant: "solid" }, "Click me");
    const input = makeNode("Input", { placeholder: "name" });

    const { container } = render(
      <WysiwygCanvas
        tree={[btn, input]}
        selectedId={null}
        onSelect={() => {}}
        viewport="full"
      />,
    );

    const wrapped = container.querySelectorAll("[data-composer-id]");
    const ids = Array.from(wrapped).map((el) =>
      (el as HTMLElement).dataset.composerId,
    );
    expect(ids).toContain(btn.id);
    expect(ids).toContain(input.id);
  });

  it("calls onSelect with the node id when a wrapped component is clicked", () => {
    const btn = makeNode("Button", {}, "Click me");
    const onSelect = vi.fn();

    const { container } = render(
      <WysiwygCanvas
        tree={[btn]}
        selectedId={null}
        onSelect={onSelect}
        viewport="full"
      />,
    );

    const wrapper = container.querySelector<HTMLElement>(
      `[data-composer-id="${btn.id}"]`,
    );
    expect(wrapper).not.toBeNull();
    // Simulate click bubbling up from an inner child (the real rendered button).
    const inner =
      (wrapper!.firstElementChild as HTMLElement | null) ?? wrapper!;
    inner.click();
    expect(onSelect).toHaveBeenCalledWith(btn.id);
  });

  it("calls onSelect(null) when clicking the empty stage", () => {
    const onSelect = vi.fn();

    const { container } = render(
      <WysiwygCanvas
        tree={[]}
        selectedId={null}
        onSelect={onSelect}
        viewport="full"
      />,
    );

    const stage = container.querySelector<HTMLElement>(
      ".wui-composer__stage",
    );
    expect(stage).not.toBeNull();
    stage!.click();
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("applies the viewport preset as maxInlineSize on the stage", () => {
    const { container, rerender } = render(
      <WysiwygCanvas
        tree={[]}
        selectedId={null}
        onSelect={() => {}}
        viewport="375"
      />,
    );
    const stage = container.querySelector<HTMLElement>(
      ".wui-composer__stage",
    )!;
    expect(stage.style.maxInlineSize).toBe("375px");

    rerender(
      <WysiwygCanvas
        tree={[]}
        selectedId={null}
        onSelect={() => {}}
        viewport="full"
      />,
    );
    expect(stage.style.maxInlineSize).toBe("100%");
  });

  it("renders the component tree content (smoke test: button text appears)", () => {
    const btn = makeNode("Button", {}, "Hello");
    render(
      <WysiwygCanvas
        tree={[btn]}
        selectedId={null}
        onSelect={() => {}}
        viewport="full"
      />,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
