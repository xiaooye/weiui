import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { defaultLoadIndex, defaultLoadComponent } from "./registry-loader.js";
import { listComponents } from "./tools/list-components.js";
import { getComponent } from "./tools/get-component.js";
import { searchComponents } from "./tools/search-components.js";
import { getExample } from "./tools/get-example.js";
import { checkUsage } from "./tools/check-usage.js";

const listComponentsInputSchema = z.object({
  category: z.string().optional(),
});

const getComponentInputSchema = z.object({
  name: z.string(),
});

const searchComponentsInputSchema = z.object({
  query: z.string(),
  limit: z.number().int().positive().optional(),
});

const getExampleInputSchema = z.object({
  name: z.string(),
  variant: z.string().optional(),
});

const checkUsageInputSchema = z.object({
  code: z.string(),
});

export interface CreateServerOptions {
  registryDir?: string;
}

/**
 * Factory that returns a configured MCP Server exposing the WeiUI tools.
 */
export function createServer(options: CreateServerOptions = {}): Server {
  const loadIndex = defaultLoadIndex(options.registryDir);
  const loadComponent = defaultLoadComponent(options.registryDir);

  const server = new Server(
    { name: "@weiui/mcp", version: "0.0.1" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "list_components",
        description:
          "List all WeiUI components. Optionally filter by category (form, overlay, data, navigation, feedback, display, layout, typography, utility, interactive, advanced-input, date).",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Restrict to a single category (e.g. 'form').",
            },
          },
        },
      },
      {
        name: "get_component",
        description:
          "Return the full registry schema for one component: props, examples, accessibility notes, and import path.",
        inputSchema: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              description: "PascalCase component name (e.g. 'Button').",
            },
          },
        },
      },
      {
        name: "search_components",
        description:
          "Ranked full-text search over component name, description, and category. Returns top-N matches.",
        inputSchema: {
          type: "object",
          required: ["query"],
          properties: {
            query: { type: "string", description: "Free-text query." },
            limit: {
              type: "integer",
              description: "Maximum number of results. Default 10.",
              minimum: 1,
            },
          },
        },
      },
      {
        name: "get_example",
        description:
          "Fetch a canonical code sample for a component. Pass `variant` to select a specific labeled example.",
        inputSchema: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              description: "PascalCase component name.",
            },
            variant: {
              type: "string",
              description: "Example label (case-insensitive). Defaults to first example.",
            },
          },
        },
      },
      {
        name: "check_usage",
        description:
          "Lint a TSX snippet for common WeiUI mistakes: Tailwind utility leakage, heavy-component imports from the main barrel, and icon-only Button without aria-label.",
        inputSchema: {
          type: "object",
          required: ["code"],
          properties: {
            code: { type: "string", description: "Raw TSX source to lint." },
          },
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "list_components") {
      const input = listComponentsInputSchema.parse(args ?? {});
      const result = await listComponents({ loadIndex }, input);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    if (name === "get_component") {
      const input = getComponentInputSchema.parse(args ?? {});
      const result = await getComponent({ loadComponent }, input);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    if (name === "search_components") {
      const input = searchComponentsInputSchema.parse(args ?? {});
      const result = await searchComponents({ loadIndex }, input);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    if (name === "get_example") {
      const input = getExampleInputSchema.parse(args ?? {});
      const result = await getExample({ loadComponent }, input);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    if (name === "check_usage") {
      const input = checkUsageInputSchema.parse(args ?? {});
      const result = await checkUsage({}, input);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

/**
 * Start the MCP server on stdio. Intended to be invoked by the `bin` entry.
 */
export async function run(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Ready line to stderr (stdout is reserved for the MCP protocol).
  console.error("[@weiui/mcp] ready — awaiting stdio messages");
}
