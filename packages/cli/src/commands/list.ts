import { listComponents } from "@weiui/mcp/tools/list-components";
import { defaultLoadIndex } from "@weiui/mcp/registry-loader";

export interface ListCommandOptions {
  category?: string;
}

export async function listCommand(opts: ListCommandOptions): Promise<string> {
  const loadIndex = defaultLoadIndex();
  const result = await listComponents({ loadIndex }, opts);
  return result.components.map((c) => c.name).join("\n");
}
