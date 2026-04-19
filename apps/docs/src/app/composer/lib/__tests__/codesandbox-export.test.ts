import { describe, it, expect, vi, afterEach } from "vitest";
import { openInCodeSandbox } from "../codesandbox-export";
import { makeNode } from "../tree";
import type { ComponentSchema } from "../../../../lib/component-schema-loader";

const schemas: ComponentSchema[] = [
  {
    name: "Button",
    category: "form",
    description: "",
    importPath: "@weiui/react",
    subpathImport: null,
    dependencies: [],
    props: [],
    compound: [],
    examples: [],
    accessibility: [],
  },
];

describe("openInCodeSandbox", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("POSTs a sandbox payload and returns the returned URL", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sandbox_id: "abc123" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const tree = [makeNode("Button", {}, "Click")];
    const url = await openInCodeSandbox(tree, schemas);

    expect(url).toBe("https://codesandbox.io/s/abc123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0]!;
    expect(endpoint).toBe(
      "https://codesandbox.io/api/v1/sandboxes/define?json=1",
    );
    const body = JSON.parse((init as RequestInit).body as string) as {
      files: Record<string, { content: string }>;
    };
    expect(body.files["src/App.tsx"]?.content).toContain("<Button");
    expect(body.files["src/App.tsx"]?.content).toContain(
      'from "@weiui/react"',
    );
    expect(body.files["package.json"]?.content).toContain("@weiui/react");
    expect(body.files["src/index.tsx"]?.content).toContain(
      "@weiui/tokens/tokens.css",
    );
    expect(body.files["index.html"]?.content).toContain("<div id=\"root\">");
  });

  it("throws when the API returns a non-OK status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("nope", { status: 500 }),
    );
    const tree = [makeNode("Button", {}, "Click")];
    await expect(openInCodeSandbox(tree, schemas)).rejects.toThrow(/500/);
  });
});
