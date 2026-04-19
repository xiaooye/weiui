import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentSelector } from "../ComponentSelector";
import type { ComponentSchema } from "../../../../lib/component-schema-loader";

const mockSchemas: ComponentSchema[] = [
  {
    name: "Button",
    category: "Actions",
    description: "Primary action component",
    importPath: "@weiui/react",
    subpathImport: null,
    dependencies: [],
    props: [],
    compound: [],
    examples: [],
    accessibility: [],
  },
  {
    name: "IconButton",
    category: "Actions",
    description: "Icon-only button",
    importPath: "@weiui/react",
    subpathImport: null,
    dependencies: [],
    props: [],
    compound: [],
    examples: [],
    accessibility: [],
  },
  {
    name: "Text",
    category: "Typography",
    description: "Text block",
    importPath: "@weiui/react",
    subpathImport: null,
    dependencies: [],
    props: [],
    compound: [],
    examples: [],
    accessibility: [],
  },
];

function fakeFetch(schemas: ComponentSchema[]) {
  return vi.fn(async (url: string | URL) => {
    const href = url.toString();
    if (href.endsWith("/registry/index.json")) {
      return {
        ok: true,
        json: async () => ({
          components: schemas.map((s) => ({ name: s.name })),
        }),
      } as Response;
    }
    const match = /\/registry\/([^/]+)\.json$/.exec(href);
    if (match) {
      const found = schemas.find((s) => s.name === match[1]);
      return {
        ok: true,
        json: async () => found,
      } as Response;
    }
    throw new Error(`unexpected fetch ${href}`);
  });
}

describe("ComponentSelector", () => {
  beforeEach(() => {
    globalThis.fetch = fakeFetch(mockSchemas) as typeof fetch;
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("groups components by category and shows the selected group expanded", async () => {
    render(<ComponentSelector selected="Button" onSelect={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
    expect(screen.getByText("Typography")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Button" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "IconButton" }),
    ).toBeInTheDocument();
  });

  it("filters by name and description (case-insensitive)", async () => {
    const user = userEvent.setup();
    render(<ComponentSelector selected="Button" onSelect={() => {}} />);
    await screen.findByText("Actions");
    const search = screen.getByPlaceholderText("Search components");
    await user.type(search, "icon");
    await waitFor(() => {
      expect(screen.queryByText("Typography")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "IconButton" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Button" })).toBeNull();
  });

  it("invokes onSelect when an item is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ComponentSelector selected="Button" onSelect={onSelect} />);
    await screen.findByRole("button", { name: "IconButton" });
    await user.click(screen.getByRole("button", { name: "IconButton" }));
    expect(onSelect).toHaveBeenCalledWith("IconButton");
  });

  it("ArrowDown moves focus within a category and Enter selects", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ComponentSelector selected="Button" onSelect={onSelect} />);
    const first = await screen.findByRole("button", { name: "Button" });
    first.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "IconButton" }),
    );
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("IconButton");
  });

  it("shows empty state when no components match", async () => {
    const user = userEvent.setup();
    render(<ComponentSelector selected="Button" onSelect={() => {}} />);
    await screen.findByText("Actions");
    await user.type(
      screen.getByPlaceholderText("Search components"),
      "zzznothing",
    );
    await waitFor(() =>
      expect(screen.getByText("No components match.")).toBeInTheDocument(),
    );
  });
});
