# F1 MCP Server

A Formula 1 Machine Control Protocol (MCP) server that provides real-time and historical F1 racing data through a standardized API interface.

## Features

- Real-time session data from OpenF1
- Historical race data from Ergast API
- Driver telemetry and car data
- Team radio and race control messages
- Weather information
- Championship standings
- Circuit information
- Pit stop data and analysis
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
- `getCarData` - Get detailed car telemetry
- `getPitStopData` - Get pit stop information
- `getTeamRadio` - Get team radio communications
- `getRaceControlMessages` - Get race control messages

#### Historical Data (Ergast API)
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