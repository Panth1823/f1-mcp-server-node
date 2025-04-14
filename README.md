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
- `getLiveTimingData` - Get live timing data for the current session.
- `getCurrentSessionStatus` - Get the status of the current or most recent session.
- `getDriverInfo` - Get information about a specific driver.
- `getHistoricalSessions` - Find session keys for historical events based on filters.
- `getHistoricRaceResults` - Get race results for a specific historical race (year, round).
- `getDriverStandings` - Get driver championship standings for a specific year.
- `getConstructorStandings` - Get constructor championship standings for a specific year.
- `getLapTimes` - Get lap times for a specific driver in a specific historical race.
- `getWeatherData` - Get weather data for a session (defaults to live session if no key provided).
- `getCarData` - Get detailed car telemetry data for a specific driver in a session.
- `getPitStopData` - Get pit stop data for a session or a specific driver.
- `getTeamRadio` - Get team radio messages for a session or a specific driver.
- `getRaceControlMessages` - Get race control messages for a session.
- `getRaceCalendar` - Get the race calendar for a specific year.
- `getCircuitInfo` - Get information about a specific circuit.
- `getSeasonList` - Get a list of available seasons.
- `getQualifyingResults` - Get qualifying results for a specific historical race (year, round).
- `getDriverInformation` - Get detailed information about a specific driver (from Ergast).
- `getConstructorInformation` - Get detailed information about a specific constructor (from Ergast).
- `clearCache` - Clear the local cache for F1 data.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Panth1823/formula1-mcp 
    cd f1-mcp-server 
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the server:**
    ```bash
    npm run build
    ```
    *After these steps, the server is ready to be configured in your MCP client.*

## Development

For development with auto-reload (compiles and restarts the server on file changes):
```bash
npm run dev
```

## Installation

After building the server (see Getting Started), you need to configure your MCP client to use it. Add the following configuration to the appropriate JSON file:

### Cursor
Add the following to your `mcp.json` file:
- **Windows:** `%APPDATA%\.cursor\mcp.json`
- **MacOS:** `~/.cursor/mcp.json`
- **Linux:** `~/.config/.cursor/mcp.json`

### Claude Desktop
Add the following to your `claude_desktop_config.json` file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

### Configuration Example
*(Remember to replace `<path-to-your-cloned-repo>` with the actual absolute path where you cloned the repository)*
```json
{
  "mcpServers": {
    "formula1": {
      "command": "node",
      // Ensure this path points to the built index.js in your cloned repo
      "args": ["<path-to-your-cloned-repo>/build/index.js"], 
      // Ensure this path points to the root of your cloned repo
      "cwd": "<path-to-your-cloned-repo>",
      "enabled": true
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

Follow the instructions in the MCP Inspector repository to set it up.

The Inspector will provide a URL to access debugging tools in your browser.
