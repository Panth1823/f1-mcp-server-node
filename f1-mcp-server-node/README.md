# F1 MCP Server Node Implementation

A TypeScript-based Formula 1 MCP server that provides real-time and historical F1 racing data through the Model Context Protocol.

## Features

### Resources
- Access F1 session data via standardized URIs
- Real-time telemetry data
- Historical race information
- Driver and constructor standings
- Weather data
- Circuit information

### Functions
- `get_current_session` - Get current session information
- `get_driver_standings` - Get driver championship standings
- `get_constructor_standings` - Get constructor standings
- `get_race_calendar` - Get race calendar information
- `get_session_results` - Get detailed session results
- `get_driver_performance` - Get driver performance metrics
- `get_telemetry` - Access detailed car telemetry
- `get_weather_data` - Get weather information
- `get_circuit_info` - Get circuit details and statistics

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "f1-mcp-server": {
      "command": "/path/to/f1-mcp-server-node/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
