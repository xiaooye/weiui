#!/usr/bin/env node
import { program } from "commander";
import { initCommand } from "./commands/init";
import { addCommand } from "./commands/add";
import { tokensBuildCommand } from "./commands/tokens-build";
import { tokensValidateCommand } from "./commands/tokens-validate";

program.name("weiui").description("WeiUI Design System CLI").version("0.0.1");
program.addCommand(initCommand);
program.addCommand(addCommand);
const tokens = program.command("tokens").description("Manage design tokens");
tokens.addCommand(tokensBuildCommand);
tokens.addCommand(tokensValidateCommand);

program
  .command("describe <component>")
  .description("Print JSON schema for a WeiUI component")
  .action(async (name: string) => {
    const { describeCommand } = await import("./commands/describe.js");
    console.log(await describeCommand(name));
  });

program
  .command("list")
  .description("List all WeiUI components")
  .option("-c, --category <cat>", "Filter by category")
  .action(async (opts: { category?: string }) => {
    const { listCommand } = await import("./commands/list.js");
    console.log(await listCommand(opts));
  });

program
  .command("examples <component>")
  .description("Print example code for a component")
  .option("-v, --variant <label>", "Specific example variant")
  .action(async (name: string, opts: { variant?: string }) => {
    const { examplesCommand } = await import("./commands/examples.js");
    console.log(await examplesCommand(name, opts));
  });

program.parse();
