# The Formula1 MCP Server ! 🏎️💨

A TypeScript-based Formula 1 MCP server, bringing the thrill of real-time and historical F1 racing data straight to your fingertips via the Model Context Protocol. Faster than Verstappen on a hot lap! (Okay, maybe not _that_ fast, but it's trying!)

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

### API Reference

Here's a detailed breakdown of each available function and its parameters:

#### `getLiveTimingData`

Get real-time timing data for the current session.

- No parameters required

#### `getCurrentSessionStatus`

Get status information about the current or most recent session.

- No parameters required

#### `getDriverInfo`

Get information about a specific driver.

- Parameters:
  - `driverId` (string): Driver identifier (e.g., "max_verstappen", "lewis_hamilton")

#### `getHistoricalSessions`

Find session keys for historical events based on filters.

- Parameters:
  - `year` (number, optional): Season year (e.g., 2023)
  - `circuit_short_name` (string, optional): Short circuit name (e.g., "monza", "spa")
  - `country_name` (string, optional): Country name (e.g., "Italy", "Belgium")
  - `location` (string, optional): Location name
  - `session_name` (string, optional): Session name (e.g., "Race", "Qualifying")

#### `getHistoricRaceResults`

Get race results for a specific historical race.

- Parameters:
  - `year` (number): Season year (e.g., 2023)
  - `round` (number): Round number (e.g., 1, 2, 3)

#### `getDriverStandings`

Get driver championship standings for a specific year.

- Parameters:
  - `year` (number): Season year (e.g., 2023)

#### `getConstructorStandings`

Get constructor championship standings for a specific year.

- Parameters:
  - `year` (number): Season year (e.g., 2023)

#### `getLapTimes`

Get lap times for a specific driver in a race.

- Parameters:
  - `year` (number): Season year (e.g., 2023)
  - `round` (number): Round number (e.g., 1, 2, 3)
  - `driverId` (string): Driver identifier (e.g., "max_verstappen", "lewis_hamilton")

#### `getWeatherData`

Get weather data for a session.

- Parameters:
  - `sessionKey` (string, optional): Session identifier (defaults to live session if not provided)

#### `getCarData`

Get detailed car telemetry data.

- Parameters:
  - `driverNumber` (string): Driver's car number (e.g., "44", "33")
  - `sessionKey` (string, optional): Session identifier
  - `filters` (string, optional): Data filters

#### `getPitStopData`

Get pit stop information.

- Parameters:
  - `driverNumber` (string, optional): Driver's car number
  - `sessionKey` (string, optional): Session identifier

#### `getTeamRadio`

Get team radio communications.

- Parameters:
  - `driverNumber` (string, optional): Driver's car number
  - `sessionKey` (string, optional): Session identifier

#### `getRaceControlMessages`

Get race control messages for a session.

- Parameters:
  - `sessionKey` (string, optional): Session identifier

#### `getRaceCalendar`

Get the Formula 1 race calendar for a specific year.

- Parameters:
  - `year` (number): Season year (e.g., 2023)

#### `getCircuitInfo`

Get detailed information about a specific circuit.

- Parameters:
  - `circuitId` (string): Circuit identifier (e.g., "monza", "spa")

#### `getSeasonList`

Get a list of available Formula 1 seasons.

- Parameters:
  - `limit` (number, optional): Number of seasons to return

#### `getQualifyingResults`

Get qualifying results for a specific race.

- Parameters:
  - `year` (number): Season year (e.g., 2023)
  - `round` (number): Round number (e.g., 1, 2, 3)

#### `getDriverInformation`

Get detailed driver information from Ergast API.

- Parameters:
  - `driverId` (string): Driver identifier (e.g., "max_verstappen", "lewis_hamilton")

#### `getConstructorInformation`

Get detailed constructor information from Ergast API.

- Parameters:
  - `constructorId` (string): Constructor identifier (e.g., "red_bull", "mercedes")

#### `clearCache`

Clear the local cache for F1 data.

- No parameters required

### API Sources

The functions above utilize different Formula 1 data sources:

- **Official F1 Live Timing API (OpenF1)**: Used for all real-time data
- **Ergest API (FastF1)**: Used for historical data

## Getting Started (Lights Out and Away We Go!)

1.  **Get the Code:**

    ```bash
    git clone https://github.com/Panth1823/formula1-mcp
    cd formula1-mcp # Navigate into the cloned directory
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Build the Server:**
    ```bash
    npm run build
    ```

🏁 **Checkered Flag!** The server is built and ready to be configured in your MCP client.

## Installation & Configuration

Once built, tell your MCP client where to find the server. Add the following configuration to the appropriate JSON file for your client:

- **Cursor:** `%APPDATA%\.cursor\mcp.json` (Windows), `~/.cursor/mcp.json` (MacOS), `~/.config/.cursor/mcp.json` (Linux)
- **Claude Desktop:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows), `~/Library/Application Support/Claude/claude_desktop_config.json` (MacOS)
- _(Other clients might have different paths)_

**Configuration Example:**

```json
{
  "mcpServers": {
    "formula1": {
      "command": "node",
      // ⚠️ IMPORTANT: Replace <path-to-your-cloned-repo> with the *absolute* path!
      "args": ["<path-to-your-cloned-repo>/build/index.js"],
      // ⚠️ IMPORTANT: Ensure this points to the root of *your* cloned repo
      "cwd": "<path-to-your-cloned-repo>",
      "enabled": true // Set to true to activate!
    }
  }
}
```

_Double-check those paths! An incorrect path is like a pit stop error – it'll cost you time._

## Example Prompts (Start Your Engines!)

Here are a few examples of how you might interact with the Formula 1 MCP server in a compatible client (like Cursor or Claude Desktop):

- "Show me the race results for the 2023 Monaco Grand Prix." (Uses `getHistoricalSessions` then `getHistoricRaceResults`)
- "Get the driver standings for the 1998 F1 season." (Uses `getDriverStandings`)
- "What was the constructor championship table in 2010?" (Uses `getConstructorStandings`)
- "Tell me about the Silverstone circuit." (Uses `getCircuitInfo`)
- "Fetch Lewis Hamilton's lap times from the 2021 Brazilian Grand Prix." (Uses `getHistoricalSessions` then `getLapTimes`)
- "Show the race calendar for 2024." (Uses `getRaceCalendar`)
- "Get information about the driver Max Verstappen." (Uses `getDriverInformation` or `getDriverInfo`)
- "What were the qualifying results for the 2022 Japanese GP?" (Uses `getHistoricalSessions` then `getQualifyingResults`)
- "List the available F1 seasons." (Uses `getSeasonList`)

_(Remember to replace specific years, circuits, drivers, or rounds with your actual query!)_

## Debugging (Box, Box, Box!)

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

Follow the instructions in the MCP Inspector repository to set it up.

The Inspector will provide a URL to access debugging tools in your browser.

## Contributing (Join the Pit Crew!)

Contributions are welcome! Whether it's adding new data sources, optimizing performance, fixing bugs, or improving documentation, your help is appreciated.

- **Found a bug?** Report it in the [Issues](https://github.com/Panth1823/formula1-mcp/issues).
- **Have an idea?** Open an issue to discuss it.
- **Ready to code?** Fork the repo and submit a Pull Request!
