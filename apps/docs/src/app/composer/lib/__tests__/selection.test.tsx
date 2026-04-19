import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { WysiwygCanvas } from "../../components/WysiwygCanvas";
import { makeNode } from "../tree";
import {
  InteractionProvider,
  useInteractionManager,
} from "../interaction-manager";
import type { ComponentNode } from "../tree";

type Api = ReturnType<typeof useInteractionManager>;

function renderWithProvider(tree: ComponentNode[]) {
  let api: Api | null = null;
  function Capture() {
    api = useInteractionManager();
    return null;
  }
  const result = render(
    <InteractionProvider>
      <Capture />
      <WysiwygCanvas tree={tree} />
    </InteractionProvider>,
  );
  return { ...result, getApi: () => api as Api };
}

describe("WysiwygCanvas", () => {
  it("mounts and wraps every node with a data-composer-id attribute", () => {
    const btn = makeNode("Button", { variant: "solid" }, "Click me");
    const input = makeNode("Input", { placeholder: "name" });

    const { container } = renderWithProvider([btn, input]);

    const wrapped = container.querySelectorAll("[data-composer-id]");
    const ids = Array.from(wrapped).map((el) =>
      (el as HTMLElement).dataset.composerId,
    );
    expect(ids).toContain(btn.id);
    expect(ids).toContain(input.id);
  });

  it("selects via the interaction manager when a wrapped component is clicked", () => {
    const btn = makeNode("Button", {}, "Click me");

    const { container, getApi } = renderWithProvider([btn]);

    const wrapper = container.querySelector<HTMLElement>(
      `[data-composer-id="${btn.id}"]`,
    );
    expect(wrapper).not.toBeNull();
    const inner =
      (wrapper!.firstElementChild as HTMLElement | null) ?? wrapper!;
    act(() => {
      inner.click();
    });
    expect(getApi().state.selection.primary).toBe(btn.id);
  });

  it("clears selection when clicking the empty stage", () => {
    const { container, getApi } = renderWithProvider([]);
    act(() => {
      getApi().select("seed-id", "replace");
    });
    expect(getApi().state.selection.primary).toBe("seed-id");

    const stage = container.querySelector<HTMLElement>(
      ".wui-composer__stage",
    );
    expect(stage).not.toBeNull();
    act(() => {
      stage!.click();
    });
    expect(getApi().state.selection.primary).toBeNull();
  });

  it("applies the viewport preset as maxInlineSize on the stage", () => {
    const { container, getApi } = renderWithProvider([]);
    const stage = container.querySelector<HTMLElement>(
      ".wui-composer__stage",
    )!;
    act(() => {
      getApi().setViewport("375");
    });
    expect(stage.style.maxInlineSize).toBe("375px");

    act(() => {
      getApi().setViewport("full");
    });
    expect(stage.style.maxInlineSize).toBe("100%");
  });

  it("renders the component tree content (smoke test: button text appears)", () => {
    const btn = makeNode("Button", {}, "Hello");
    renderWithProvider([btn]);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
