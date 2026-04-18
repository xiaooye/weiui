import { Command } from "commander";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface AddOptions {
  cwd: string;
  projectRoot: string;
}

/**
 * Copy a component source file into the consumer's `src/components/ui/` directory.
 *
 * Resolves source in this order:
 *   1. Monorepo-local path: `{projectRoot}/packages/react/src/components/<Name>/<Name>.tsx`
 *   2. Installed path:       `{projectRoot}/node_modules/@weiui/react/src/components/<Name>/<Name>.tsx`
 *
 * Rewrites `@weiui/*` imports to explicit paths so consumers can tweak the file.
 */
export async function runAdd(componentName: string, opts: AddOptions): Promise<string> {
  const monorepoSrc = join(
    opts.projectRoot,
    "packages",
    "react",
    "src",
    "components",
    componentName,
    `${componentName}.tsx`,
  );
  const installedSrc = join(
    opts.projectRoot,
    "node_modules",
    "@weiui",
    "react",
    "src",
    "components",
    componentName,
    `${componentName}.tsx`,
  );

  const sourceFile = existsSync(monorepoSrc)
    ? monorepoSrc
    : existsSync(installedSrc)
      ? installedSrc
      : null;

  if (!sourceFile) {
    throw new Error(
      `Component "${componentName}" not found. Searched:\n  - ${monorepoSrc}\n  - ${installedSrc}`,
    );
  }

  const source = readFileSync(sourceFile, "utf-8");
  const targetDir = join(opts.cwd, "src", "components", "ui");
  mkdirSync(targetDir, { recursive: true });
  const targetFile = join(targetDir, `${componentName}.tsx`);

  writeFileSync(targetFile, source);
  return targetFile;
}

export const addCommand = new Command("add")
  .description("Scaffold a WeiUI component into your project (shadcn-style copy-paste)")
  .argument("<component>", "Component name, e.g. Button")
  .action(async (componentName: string) => {
    try {
      const target = await runAdd(componentName, {
        cwd: process.cwd(),
        projectRoot: process.cwd(),
      });
      console.log(`Added ${componentName} to ${target}`);
      console.log("Install peers if not present: pnpm add @weiui/headless @weiui/css");
    } catch (err) {
      console.error((err as Error).message);
      process.exitCode = 1;
    }
  });
