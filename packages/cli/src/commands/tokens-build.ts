import { Command } from "commander";
import { execFileSync } from "node:child_process";

export const tokensBuildCommand = new Command("build")
  .description("Compile tokens to CSS/JSON/TS")
  .action(() => {
    console.log("Building tokens...");
    try {
      execFileSync("pnpm", ["--filter", "@weiui/tokens", "build"], { stdio: "inherit" });
    } catch {
      process.exit(1);
    }
  });
