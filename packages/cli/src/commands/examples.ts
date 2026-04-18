import { getExample } from "@weiui/mcp/tools/get-example";
import { defaultLoadComponent } from "@weiui/mcp/registry-loader";

export interface ExamplesCommandOptions {
  variant?: string;
}

export async function examplesCommand(
  name: string,
  opts: ExamplesCommandOptions,
): Promise<string> {
  const loadComponent = defaultLoadComponent();
  const result = await getExample({ loadComponent }, { name, variant: opts.variant });
  if (!result.example) return `No example found for ${name}.`;
  return `# ${result.example.label}\n\n${result.example.code}`;
}
