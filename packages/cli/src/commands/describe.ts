import { getComponent } from "@civaria/mcp/tools/get-component";
import { defaultLoadComponent } from "@civaria/mcp/registry-loader";

export async function describeCommand(name: string): Promise<string> {
  const loadComponent = defaultLoadComponent();
  const result = await getComponent({ loadComponent }, { name });
  return JSON.stringify(result, null, 2);
}
