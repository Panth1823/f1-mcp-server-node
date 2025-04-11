# F1 MCP Server

A Formula 1 Machine Control Protocol (MCP) server that provides real-time and historical F1 racing data through a standardized API interface.

## Features

- Real-time session data from OpenF1
- Historical race data from Ergast API
- Enhanced telemetry and car data analysis
- Detailed sector time analysis
- Tyre strategy and performance insights
- Track position visualization
- Driver performance comparison
- Qualifying session analysis
- Sprint race data analysis
- Driver career statistics
- Circuit records and history
- Race start performance analysis
- Team radio and race control messages
- Weather information
- Championship standings
- Circuit information
- Pit stop data and analysis
- Race simulation and predictions
- Battle analysis and overtaking probability
- Driver performance metrics
- Lap-by-lap detailed analysis
- Season comparison tools
- In-memory caching for optimized performance
- Comprehensive error handling
- WebSocket support for live updates

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Panth1823/f1-mcp.git
cd f1-mcp
```

2. Install dependencies:
```bash
cd f1-mcp-server-node
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Usage

Build and start the server:

```bash
npm run build
npm start
```

The server will start and listen for MCP protocol commands via stdin/stdout.

## Testing

Run the test suite:

```bash
npm test
```

Run the integration test script:

```bash
cd ../scripts
node test-mcp-server.js
```

## API Documentation

### Available Tools

#### Live Data (OpenF1 API)
- `getLiveTimingData` - Get real-time lap timing information
- `getCurrentSessionStatus` - Get current session information
- `getWeatherData` - Get real-time weather information
- `getCarData` - Get basic car telemetry
- `getPitStopData` - Get pit stop information
- `getTeamRadio` - Get team radio communications
- `getRaceControlMessages` - Get race control messages

#### Enhanced Telemetry and Analysis
- `getDetailedTelemetry` - Get comprehensive telemetry data including ERS, fuel, and tyre information
- `getSectorAnalysis` - Get detailed sector time analysis with personal and session bests
- `getTyreStrategy` - Get tyre compound usage and performance analysis
- `getTrackPositions` - Get real-time track position data and gaps
- `getDriverComparison` - Compare telemetry data between two drivers

#### Advanced Race Analysis
- `getLapAnalysis` - Get detailed analysis of individual laps including sector times, speed traps, and conditions
- `getRaceSimulation` - Get predictive race analysis including optimal pit windows and strategy
- `getDriverPerformance` - Get comprehensive driver performance metrics including sector consistency
- `getBattleAnalysis` - Get detailed analysis of on-track battles including overtaking probability

#### Session-Specific Analysis
- `getQualifyingAnalysis` - Get detailed qualifying session analysis with all session times
- `getSprintSessionData` - Get comprehensive sprint race session data
- `getRaceStartAnalysis` - Get detailed analysis of race start performance
- `getTyrePerformance` - Get detailed tyre performance and degradation analysis

#### Historical and Statistical Analysis
- `getDriverCareerStats` - Get comprehensive career statistics for a driver
- `getCircuitRecords` - Get historical records and statistics for a circuit
- `getSeasonComparison` - Compare statistics between two seasons
- `getDriverStandings` - Get driver championship standings
- `getConstructorStandings` - Get constructor championship standings
- `getHistoricRaceResults` - Get race results
- `getLapTimes` - Get detailed lap time information
- `getRaceCalendar` - Get race calendar for a season
- `getCircuitInfo` - Get circuit information
- `getSeasonList` - Get list of F1 seasons
- `getQualifyingResults` - Get qualifying session results
- `getDriverInformation` - Get detailed driver information
- `getConstructorInformation` - Get detailed constructor information

#### Utility Tools
- `clearCache` - Clear the internal data cache

For detailed API documentation, see [docs/api.md](docs/api.md).

## Data Sources

This project uses the following data sources:
- [OpenF1 API](https://openf1.org/) - For real-time F1 data
- [Ergast API](http://ergast.com/mrd/) - For historical F1 data

## Development

### Running in Development Mode

```bash
npm run dev
```

### Project Structure

```
f1-mcp-server/
├── f1-mcp-server-node/  # Main Node.js application
│   ├── src/            # Source code
│   │   ├── services/   # Data services 
│   │   ├── types/      # Type definitions
│   │   ├── websocket/  # WebSocket support
│   │   ├── middleware/ # Server middleware
│   │   └── __tests__/  # Unit tests
│   ├── build/          # Compiled code
│   └── node_modules/   # Dependencies
├── docs/              # Documentation
├── fastf1_cache/      # Cache for FastF1 data (when used)
└── scripts/           # Utility scripts
```

## Features and Optimizations

- **In-memory caching**: Reduces API calls and improves performance with configurable TTL
- **Error handling**: Comprehensive error handling with informative messages
- **Data validation**: Schema validation using Zod
- **TypeScript**: Fully typed codebase for better developer experience
- **Testing**: Unit and integration tests included

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 