# The Formula1 MCP Server 🏎️

Get F1 data instantly through MCP. Live timing, historical stats, and more - all in one place.

### Resources

- F1 session data
- Real-time telemetry
- Historical races
- Standings
- Weather data
- Circuit info

### Tools

- `getLiveTimingData` - Live session timing
- `getCurrentSessionStatus` - Session status
- `getDriverInfo` - Driver info
- `getHistoricalSessions` - Find past sessions
- `getHistoricRaceResults` - Past race results
- `getDriverStandings` - Driver standings
- `getConstructorStandings` - Team standings
- `getLapTimes` - Lap times
- `getWeatherData` - Track weather
- `getCarData` - Car telemetry
- `getPitStopData` - Pit stops
- `getTeamRadio` - Team radio
- `getRaceControlMessages` - Race control
- `getRaceCalendar` - Season calendar
- `getCircuitInfo` - Circuit details
- `getSeasonList` - Available seasons
- `getQualifyingResults` - Qualifying results
- `getDriverInformation` - Driver details (Ergast)
- `getConstructorInformation` - Team details (Ergast)
- `clearCache` - Clear cache

### API Reference

Here's what each function does:

#### `getLiveTimingData`
Get live timing data
- No parameters

#### `getCurrentSessionStatus`
Get session status
- No parameters

#### `getDriverInfo`
Get driver info
- `driverId`: Driver ID (e.g., "max_verstappen")

#### `getHistoricalSessions`
Find past sessions
- `year`: Season year (optional)
- `circuit_short_name`: Circuit (optional)
- `country_name`: Country (optional)
- `location`: Location (optional)
- `session_name`: Session type (optional)

#### `getHistoricRaceResults`
Get race results
- `year`: Season year
- `round`: Race number

#### `getDriverStandings`
Get championship standings
- `year`: Season year

#### `getConstructorStandings`
Get team standings
- `year`: Season year

#### `getLapTimes`
Get lap times
- `year`: Season year
- `round`: Race number
- `driverId`: Driver ID

#### `getWeatherData`
Get weather data
- `sessionKey`: Session ID (optional)

#### `getCarData`
Get telemetry data
- `driverNumber`: Car number
- `sessionKey`: Session ID (optional)
- `filters`: Data filters (optional)

#### `getPitStopData`
Get pit stop info
- `driverNumber`: Car number (optional)
- `sessionKey`: Session ID (optional)

#### `getTeamRadio`
Get team radio
- `driverNumber`: Car number (optional)
- `sessionKey`: Session ID (optional)

#### `getRaceControlMessages`
Get race control messages
- `sessionKey`: Session ID (optional)

#### `getRaceCalendar`
Get season calendar
- `year`: Season year

#### `getCircuitInfo`
Get circuit info
- `circuitId`: Circuit ID

#### `getSeasonList`
Get available seasons
- `limit`: Number of seasons (optional)

#### `getQualifyingResults`
Get qualifying results
- `year`: Season year
- `round`: Race number

#### `getDriverInformation`
Get driver details
- `driverId`: Driver ID

#### `getConstructorInformation`
Get team details
- `constructorId`: Team ID

#### `clearCache`
Clear data cache
- No parameters

### Data Sources

- Live data: F1 Live Timing API (OpenF1)
- Historical: Ergast API (FastF1)

## Getting Started

1. Clone the repo:
```bash
git clone https://github.com/Panth1823/formula1-mcp
cd formula1-mcp
```

2. Install:
```bash
npm install
```

3. Build:
```bash
npm run build
```

## Setup

Add to your MCP client config:

```json
{
  "mcpServers": {
    "formula1": {
      "command": "node",
      "args": ["<path-to-your-cloned-repo>/build/index.js"],
      "cwd": "<path-to-your-cloned-repo>",
      "enabled": true
    }
  }
}
```

Config locations:
- Windows: `%APPDATA%\.cursor\mcp.json`
- MacOS: `~/.cursor/mcp.json`
- Linux: `~/.config/.cursor/mcp.json`

## Examples

- "Show 2023 Monaco GP results"
- "Get current standings"
- "Weather at Silverstone"
- "Hamilton's lap times"
- "Show 2024 calendar"
- "Verstappen's info"
- "Japanese GP qualifying"

## Debug

Use [MCP Inspector](https://github.com/modelcontextprotocol/inspector) for debugging.

## Help

- Bugs? [Report here](https://github.com/Panth1823/formula1-mcp/issues)
- Questions? Open an issue
- Want to help? Submit a PR
