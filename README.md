# F1 MCP Server

A Formula 1 Model Context Protocol (MCP) server that provides real-time and historical F1 racing data through a standardized API interface.

## Features

### Live Data
- Real-time timing data and session information
- Weather data and track conditions
- Enhanced car telemetry and performance metrics
- Pit stop information and analysis
- Team radio communications
- Race control messages
- Track position visualization
- ERS and fuel usage data

### Historical Data
- Race results and session archives
- Driver and constructor standings
- Detailed lap time analysis
- Circuit information and records
- Season statistics and comparisons
- Driver career statistics
- Battle analysis and overtaking data

## Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Panth1823/f1-mcp-server-node.git
cd f1-mcp-server-node
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Usage

1. Development mode:
```bash
npm run dev
```

2. Production mode:
```bash
npm run build
npm start
```

## Available Endpoints

### Live Session Data
- `getLiveTimingData` - Real-time timing information
- `getCurrentSessionStatus` - Current session status
- `getWeatherData` - Weather conditions
- `getCarData` - Enhanced car telemetry
- `getPitStopData` - Pit stop information
- `getTeamRadio` - Team radio messages
- `getRaceControlMessages` - Race control updates
- `getDetailedTelemetry` - Comprehensive telemetry including ERS and fuel
- `getSectorAnalysis` - Detailed sector time analysis
- `getTyreStrategy` - Tyre performance analysis
- `getTrackPositions` - Real-time track position data

### Historical Data
- `getHistoricalSessions` - Past session data
- `getHistoricRaceResults` - Race results
- `getDriverStandings` - Championship standings
- `getConstructorStandings` - Team standings
- `getLapTimes` - Detailed lap timing
- `getDriverCareerStats` - Career statistics
- `getBattleAnalysis` - On-track battle analysis

### Calendar and Circuit Info
- `getRaceCalendar` - Season calendar
- `getCircuitInfo` - Track information
- `getQualifyingResults` - Qualifying data
- `getCircuitRecords` - Historical records

### Team and Driver Info
- `getDriverInformation` - Driver details
- `getConstructorInformation` - Team details
- `getDriverPerformance` - Performance metrics

### Utility
- `clearCache` - Clear data cache

## Development

### Project Structure
```
f1-mcp-server/
├── src/            # Source code
│   ├── services/   # Data services 
│   ├── types/      # Type definitions
│   ├── websocket/  # WebSocket support
│   └── middleware/ # Server middleware
├── build/          # Compiled code
└── scripts/        # Utility scripts
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Code Style
```bash
# Run linter
npm run lint

# Format code
npm run format
```

### Best Practices
1. Handle errors appropriately
2. Cache responses when possible
3. Use TypeScript types
4. Write tests for new features
5. Follow existing code style

### Common Issues

#### Cache Issues
- Use `clearCache` endpoint to refresh data
- Restart server if issues persist

#### API Issues
- Verify environment variables
- Check endpoint availability
- Monitor rate limits

## Data Sources
- OpenF1 API - For real-time F1 data
- Ergast API - For historical F1 data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 