import { Command } from "commander";
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const initCommand = new Command("init")
  .description("Initialize WeiUI in a project")
  .action(() => {
    const cwd = process.cwd();
    const configPath = join(cwd, "weiui.config.json");

    if (existsSync(configPath)) {
      console.log("weiui.config.json already exists, skipping");
    } else {
      writeFileSync(
        configPath,
        JSON.stringify(
          {
            $schema: "https://ui.wei-dev.com/schema.json",
            tokens: "./tokens",
            output: {
              css: "./styles/weiui-tokens.css",
              ts: "./lib/weiui-tokens.ts",
            },
          },
          null,
          2,
        ),
      );
      console.log("Created weiui.config.json");
    }

    console.log("\nWeiUI initialized. Next steps:");
    console.log("  1. Install: pnpm add @weiui/css @weiui/tokens");
    console.log('  2. Import CSS: @import "@weiui/css"');
    console.log('  3. Use components: <button class="wui-button wui-button--solid">Click</button>');
  });
