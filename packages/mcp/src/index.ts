#!/usr/bin/env node
import { run } from "./server.js";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("civaria-mcp — Civaria Model Context Protocol server");
  console.log("Usage: civaria-mcp");
  console.log("Starts the Civaria MCP server over stdio.");
  process.exit(0);
}

run().catch((err) => {
  console.error("[@civaria/mcp] fatal:", err);
  process.exit(1);
});