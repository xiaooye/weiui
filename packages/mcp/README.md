# @weiui/mcp

Model Context Protocol server for [WeiUI](https://weiui.dev). Lets AI agents
(Claude Desktop, Cursor, Codex, Windsurf, Copilot, etc.) introspect the
component library at runtime — discover components, read their props, grab
canonical examples, and lint draft code before shipping it.

## Quick start

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "weiui": {
      "command": "npx",
      "args": ["-y", "@weiui/mcp"]
    }
  }
}
```

Restart Claude Desktop. The five tools below appear in the tool picker.

### CLI smoke test

```bash
npx @weiui/mcp
```

Prints a ready line to stderr and waits on stdio. Kill with Ctrl-C.

## Tools

| Tool | Description |
| --- | --- |
| `list_components` | Enumerate every component, optionally filtered by category. |
| `get_component` | Full schema (props, examples, a11y) for one component. |
| `search_components` | Ranked search over name, description, category. |
| `get_example` | Return a canonical code sample for a component. |
| `check_usage` | Lint a draft TSX snippet for common WeiUI mistakes. |

## How it works

Each tool reads JSON emitted by `apps/docs/scripts/build-registry.ts` and
served at `https://weiui.dev/registry/<Name>.json`. The published npm
package ships a snapshot under `./registry/` so offline use works without
any network call.

## License

MIT
