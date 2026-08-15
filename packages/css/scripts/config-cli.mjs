#!/usr/bin/env node
import { bundleConfigFile, describeConfig, validateConfigFile, WeiUIConfigError } from "./config.mjs";

function usage() {
  return [
    "WeiUI CSS config tooling",
    "",
    "Usage:",
    "  weiui-css describe",
    "  weiui-css validate [weiui.config.json]",
    "  weiui-css bundle [weiui.config.json]",
  ].join("\n");
}

async function main() {
  const [command, configFile = "weiui.config.json", ...extra] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help" || command === "-h") {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (extra.length) throw new WeiUIConfigError("invalid_cli", `unexpected arguments: ${extra.join(" ")}`);

  let result;
  if (command === "describe") {
    if (process.argv.slice(2).length > 1) throw new WeiUIConfigError("invalid_cli", "describe takes no config path");
    result = await describeConfig();
  } else if (command === "validate") {
    result = await validateConfigFile(configFile);
  } else if (command === "bundle") {
    result = await bundleConfigFile(configFile);
  } else {
    throw new WeiUIConfigError("invalid_cli", `unknown command: ${command}`);
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  const payload = error instanceof WeiUIConfigError
    ? { schema: "weiui_css_config_error_v1", code: error.code, message: error.message, detail: error.detail ?? null }
    : { schema: "weiui_css_config_error_v1", code: "unexpected_error", message: String(error) };
  process.stderr.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exitCode = 1;
});
