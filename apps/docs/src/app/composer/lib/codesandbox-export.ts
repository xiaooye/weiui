import { generateCode, makeSchemaResolver } from "./generate-code";
import type { ComponentNode } from "./tree";
import type { ComponentSchema } from "../../../lib/component-schema-loader";

/**
 * POST the generated composition to the CodeSandbox define-API and return the
 * sandbox URL. Caller is responsible for opening the URL in a new tab.
 *
 * Uses the public `sandboxes/define?json=1` endpoint — no auth needed. The
 * payload bundles the generated `App.tsx`, an `index.tsx` entry that imports
 * WeiUI styles, a `package.json`, and a minimal HTML shell.
 */
export async function openInCodeSandbox(
  tree: ComponentNode[],
  schemas: ComponentSchema[],
): Promise<string> {
  const resolver = makeSchemaResolver(
    schemas.map((s) => ({
      name: s.name,
      importPath: s.importPath,
      subpathImport: s.subpathImport ?? null,
    })),
  );
  const code = generateCode(tree, resolver, {
    target: "tsx",
    includeImports: true,
    componentWrap: true,
  });

  const indexTsx =
    `import "@weiui/tokens/tokens.css";\n` +
    `import "@weiui/css";\n` +
    `import { createRoot } from "react-dom/client";\n` +
    `import App from "./App";\n` +
    `const el = document.getElementById("root");\n` +
    `if (el) createRoot(el).render(<App />);\n`;

  const indexHtml =
    `<!DOCTYPE html>\n` +
    `<html lang="en">\n` +
    `  <head>\n` +
    `    <meta charset="utf-8" />\n` +
    `    <meta name="viewport" content="width=device-width, initial-scale=1" />\n` +
    `    <title>WeiUI Composition</title>\n` +
    `  </head>\n` +
    `  <body>\n` +
    `    <div id="root"></div>\n` +
    `    <script type="module" src="/src/index.tsx"></script>\n` +
    `  </body>\n` +
    `</html>\n`;

  const packageJson = JSON.stringify(
    {
      name: "weiui-composition",
      version: "0.0.0",
      private: true,
      dependencies: {
        "@weiui/react": "latest",
        "@weiui/css": "latest",
        "@weiui/tokens": "latest",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
      },
      devDependencies: {
        "@types/react": "^19.0.0",
        "@types/react-dom": "^19.0.0",
        typescript: "^5.6.0",
        vite: "^5.4.0",
        "@vitejs/plugin-react": "^4.3.0",
      },
      scripts: {
        dev: "vite",
        build: "vite build",
      },
    },
    null,
    2,
  );

  const files = {
    "package.json": { content: packageJson },
    "src/App.tsx": { content: code },
    "src/index.tsx": { content: indexTsx },
    "index.html": { content: indexHtml },
  };

  const res = await fetch(
    "https://codesandbox.io/api/v1/sandboxes/define?json=1",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ files }),
    },
  );
  if (!res.ok) {
    throw new Error(`CodeSandbox responded ${res.status}`);
  }
  const json = (await res.json()) as { sandbox_id: string };
  return `https://codesandbox.io/s/${json.sandbox_id}`;
}
