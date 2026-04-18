import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { defaultLoadIndex } from "./registry-loader.js";
import { listComponents } from "./tools/list-components.js";

const listComponentsInputSchema = z.object({
  category: z.string().optional(),
});

export interface CreateServerOptions {
  registryDir?: string;
}

/**
 * Factory that returns a configured MCP Server exposing the WeiUI tools.
 */
export function createServer(options: CreateServerOptions = {}): Server {
  const loadIndex = defaultLoadIndex(options.registryDir);

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
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "list_components") {
      const input = listComponentsInputSchema.parse(args ?? {});
      const result = await listComponents({ loadIndex }, input);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
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
