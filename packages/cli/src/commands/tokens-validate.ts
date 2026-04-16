import { Command } from "commander";
import { execFileSync } from "node:child_process";

export const tokensValidateCommand = new Command("validate")
  .description("Validate AAA contrast compliance")
  .action(() => {
    console.log("Validating token contrast...");
    try {
      execFileSync("pnpm", ["--filter", "@weiui/tokens", "validate"], { stdio: "inherit" });
    } catch {
      process.exit(1);
    }
  });
