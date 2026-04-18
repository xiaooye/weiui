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
program.parse();
