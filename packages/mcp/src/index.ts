#!/usr/bin/env node
import { run } from "./server.js";

run().catch((err) => {
  console.error("[@weiui/mcp] fatal:", err);
  process.exit(1);
});
