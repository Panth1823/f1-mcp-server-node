import { spawn } from 'child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'fs';
import path from 'path';

// Helper function to log to both console and file
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;
  
  if (data) {
    if (typeof data === 'object') {
      logMessage += '\n' + JSON.stringify(data, null, 2);
    } else {
      logMessage += ' ' + data;
    }
  }
  
  console.log(logMessage);
  appendFileSync('advanced-params-test-results.log', logMessage + '\n');
}

// A simple implementation to communicate with MCP server via standard I/O
class McpProcessCommunicator {
  constructor(command, args) {
    this.process = spawn(command, args, { stdio: ['pipe', 'pipe', process.stderr] });
    this.messageId = 1;
    this.pendingRequests = new Map();
    this.debug = true;
    
    this.process.stdout.on('data', (data) => {
      const rawData = data.toString().trim();
      if (this.debug) {
        log('[DEBUG] Raw server response:', rawData);
      }
      
      try {
        const responses = rawData.split('\n').filter(line => line.trim());
        
        for (const response of responses) {
          const parsed = JSON.parse(response);
          if (this.debug) {
            log('[DEBUG] Parsed response:', parsed);
          }
          
          if (parsed.id) {
            const resolver = this.pendingRequests.get(parsed.id);
            if (resolver) {
              resolver.resolve(parsed);
              this.pendingRequests.delete(parsed.id);
            }
          }
        }
      } catch (error) {
        log('[ERROR] Error parsing server response:', error);
      }
    });
    
    // Handle errors
    this.process.on('error', (error) => {
      log('[ERROR] MCP Server process error:', error);
    });
    
    this.process.on('exit', (code, signal) => {
      log(`[INFO] MCP Server process exited with code ${code} and signal ${signal}`);
    });
  }
  
  async sendRequest(method, params = {}) {
    const id = this.messageId++;
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };
      
      const requestStr = JSON.stringify(request);
      if (this.debug) {
        log('[DEBUG] Sending request:', requestStr);
      }
      
      this.process.stdin.write(requestStr + '\n');
    });
  }
  
  close() {
    this.process.kill();
  }
}

async function main() {
  try {
    // Create output file
    writeFileSync('advanced-params-test-results.log', '--- F1 MCP SERVER ADVANCED PARAMETER TESTS ---\n\n');
    
    log('Starting F1 MCP Server advanced parameter tests...');
    
    // Create a process communicator for the MCP server
    const serverPath = path.resolve('../f1-mcp-server-node/build/index.js');
    log('[INFO] Server path:', serverPath);
    const client = new McpProcessCommunicator('node', [serverPath]);
    
    // Initialize the server following the MCP protocol
    log('Initializing MCP server...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give process time to start
    
    // Initialize the connection with the server
    try {
      log('Initializing MCP protocol...');
      const initResult = await client.sendRequest('initialize', {
        protocolVersion: '0.5.0',
        clientInfo: {
          name: 'f1-mcp-advanced-test-client',
          version: '1.0.0'
        },
        capabilities: {
          tools: true
        }
      });
      log('Initialize result:', initResult);
      
      if (initResult.error) {
        log('[ERROR] Failed to initialize MCP protocol:', initResult.error);
        process.exit(1);
      }
      
      // List available tools
      log('Listing available tools...');
      const toolsResult = await client.sendRequest('tools/list', {});
      log('Available tools:', toolsResult);
      
      // Run the advanced parameter tests
      await runAdvancedTests(client);
      
      log('All advanced parameter tests completed!');
    } catch (error) {
      log('[ERROR] Error during testing:', error);
    }
    
    // Close the connection
    client.close();
    process.exit(0);
  } catch (error) {
    log('[ERROR] Test failed:', error);
    process.exit(1);
  }
}

async function runAdvancedTests(client) {
  const tests = [
    // Test different years for standings
    {
      name: "Getting driver standings for 2021",
      method: "tools/call",
      params: { name: "getDriverStandings", arguments: { year: 2021 } }
    },
    {
      name: "Getting driver standings for 2022",
      method: "tools/call",
      params: { name: "getDriverStandings", arguments: { year: 2022 } }
    },
    {
      name: "Getting constructor standings for 2021",
      method: "tools/call",
      params: { name: "getConstructorStandings", arguments: { year: 2021 } }
    },
    {
      name: "Getting constructor standings for 2022",
      method: "tools/call",
      params: { name: "getConstructorStandings", arguments: { year: 2022 } }
    },
    
    // Test historic race results from different grands prix
    {
      name: "Getting historic race results for 2022 Monaco GP (round 7)",
      method: "tools/call",
      params: { name: "getHistoricRaceResults", arguments: { year: 2022, round: 7 } }
    },
    {
      name: "Getting historic race results for 2022 British GP (round 10)",
      method: "tools/call",
      params: { name: "getHistoricRaceResults", arguments: { year: 2022, round: 10 } }
    },
    {
      name: "Getting historic race results for 2022 Italian GP (round 16)",
      method: "tools/call",
      params: { name: "getHistoricRaceResults", arguments: { year: 2022, round: 16 } }
    },
    
    // Test driver info for different drivers
    {
      name: "Getting driver info for Hamilton (44)",
      method: "tools/call",
      params: { name: "getDriverInfo", arguments: { driverId: "44" } }
    },
    {
      name: "Getting driver info for Leclerc (16)",
      method: "tools/call",
      params: { name: "getDriverInfo", arguments: { driverId: "16" } }
    },
    {
      name: "Getting driver info for Verstappen (1)",
      method: "tools/call",
      params: { name: "getDriverInfo", arguments: { driverId: "1" } }
    },
    
    // Test lap times for different drivers at different races
    {
      name: "Getting lap times for Hamilton at 2022 British GP",
      method: "tools/call",
      params: { name: "getLapTimes", arguments: { year: 2022, round: 10, driverId: "hamilton" } }
    },
    {
      name: "Getting lap times for Verstappen at 2022 Dutch GP",
      method: "tools/call",
      params: { name: "getLapTimes", arguments: { year: 2022, round: 15, driverId: "max_verstappen" } }
    },
    
    // Test car data with filters
    {
      name: "Getting car data for Verstappen with speed filter",
      method: "tools/call",
      params: { name: "getCarData", arguments: { driverNumber: "1", filters: "speed>=300" } }
    },
    {
      name: "Getting car data for Hamilton with DRS filter",
      method: "tools/call",
      params: { name: "getCarData", arguments: { driverNumber: "44", filters: "drs=10" } }
    },
    
    // Test pit stop data for specific drivers
    {
      name: "Getting pit stop data for Leclerc",
      method: "tools/call",
      params: { name: "getPitStopData", arguments: { driverNumber: "16" } }
    },
    {
      name: "Getting pit stop data for Verstappen",
      method: "tools/call",
      params: { name: "getPitStopData", arguments: { driverNumber: "1" } }
    },
    
    // Test team radio for different drivers
    {
      name: "Getting team radio for Alonso",
      method: "tools/call",
      params: { name: "getTeamRadio", arguments: { driverNumber: "14" } }
    },
    {
      name: "Getting team radio for Verstappen",
      method: "tools/call",
      params: { name: "getTeamRadio", arguments: { driverNumber: "1" } }
    },
    
    // Test race calendars for different years
    {
      name: "Getting 2021 race calendar",
      method: "tools/call",
      params: { name: "getRaceCalendar", arguments: { year: 2021 } }
    },
    {
      name: "Getting 2022 race calendar",
      method: "tools/call",
      params: { name: "getRaceCalendar", arguments: { year: 2022 } }
    },
    {
      name: "Getting 2023 race calendar",
      method: "tools/call",
      params: { name: "getRaceCalendar", arguments: { year: 2023 } }
    },
    
    // Test circuit info for famous tracks
    {
      name: "Getting circuit info for Monaco",
      method: "tools/call",
      params: { name: "getCircuitInfo", arguments: { circuitId: "monaco" } }
    },
    {
      name: "Getting circuit info for Silverstone",
      method: "tools/call",
      params: { name: "getCircuitInfo", arguments: { circuitId: "silverstone" } }
    },
    {
      name: "Getting circuit info for Monza",
      method: "tools/call",
      params: { name: "getCircuitInfo", arguments: { circuitId: "monza" } }
    },
    {
      name: "Getting circuit info for Spa",
      method: "tools/call",
      params: { name: "getCircuitInfo", arguments: { circuitId: "spa" } }
    },
    
    // Test season list with different limits
    {
      name: "Getting first 5 F1 seasons",
      method: "tools/call",
      params: { name: "getSeasonList", arguments: { limit: 5 } }
    },
    {
      name: "Getting first 10 F1 seasons",
      method: "tools/call",
      params: { name: "getSeasonList", arguments: { limit: 10 } }
    },
    
    // Test qualifying results for memorable qualifyings
    {
      name: "Getting qualifying results for 2021 Abu Dhabi GP (championship decider)",
      method: "tools/call",
      params: { name: "getQualifyingResults", arguments: { year: 2021, round: 22 } }
    },
    {
      name: "Getting qualifying results for 2022 Emilia Romagna GP (wet qualifying)",
      method: "tools/call",
      params: { name: "getQualifyingResults", arguments: { year: 2022, round: 4 } }
    },
    
    // Test driver and constructor detailed information
    {
      name: "Getting detailed driver information for Hamilton",
      method: "tools/call",
      params: { name: "getDriverInformation", arguments: { driverId: "hamilton" } }
    },
    {
      name: "Getting detailed driver information for Schumacher",
      method: "tools/call",
      params: { name: "getDriverInformation", arguments: { driverId: "michael_schumacher" } }
    },
    {
      name: "Getting detailed constructor information for Ferrari",
      method: "tools/call",
      params: { name: "getConstructorInformation", arguments: { constructorId: "ferrari" } }
    },
    {
      name: "Getting detailed constructor information for McLaren",
      method: "tools/call",
      params: { name: "getConstructorInformation", arguments: { constructorId: "mclaren" } }
    }
  ];
  
  // Run each test with a delay between them
  for (const test of tests) {
    log(`Test: ${test.name}...`);
    try {
      const result = await client.sendRequest(test.method, test.params);
      // Check if result contains any data
      if (result.result && result.result.content && result.result.content[0].text) {
        const data = JSON.parse(result.result.content[0].text);
        const summary = summarizeResult(data, test.params.name);
        log(`${test.name} result summary:`, summary);
      } else {
        log(`${test.name} result:`, result);
      }
    } catch (error) {
      log(`[ERROR] ${test.name} test failed:`, error);
    }
    
    // Wait between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

// Helper function to create a summary of the API response based on the endpoint called
function summarizeResult(data, endpoint) {
  let summary = {};
  
  try {
    switch(endpoint) {
      case 'getDriverStandings':
        summary = {
          season: data.season,
          round: data.round || 'Final',
          totalDrivers: data.DriverStandings ? data.DriverStandings.length : 0,
          leader: data.DriverStandings && data.DriverStandings.length > 0 ? 
            `${data.DriverStandings[0].Driver.givenName} ${data.DriverStandings[0].Driver.familyName} (${data.DriverStandings[0].points} pts)` : 'N/A'
        };
        break;
        
      case 'getConstructorStandings':
        summary = {
          season: data.season,
          round: data.round || 'Final',
          totalConstructors: data.ConstructorStandings ? data.ConstructorStandings.length : 0,
          leader: data.ConstructorStandings && data.ConstructorStandings.length > 0 ? 
            `${data.ConstructorStandings[0].Constructor.name} (${data.ConstructorStandings[0].points} pts)` : 'N/A'
        };
        break;
        
      case 'getHistoricRaceResults':
        summary = {
          raceName: data.raceName,
          season: data.season,
          round: data.round,
          date: data.date,
          totalResults: data.Results ? data.Results.length : 0,
          winner: data.Results && data.Results.length > 0 ? 
            `${data.Results[0].Driver.givenName} ${data.Results[0].Driver.familyName} (${data.Results[0].Constructor.name})` : 'N/A'
        };
        break;
        
      case 'getDriverInfo':
        if (Array.isArray(data) && data.length > 0) {
          summary = {
            driverNumber: data[0].driver_number,
            name: data[0].full_name,
            team: data[0].team_name,
            codeOrAcronym: data[0].name_acronym || data[0].broadcast_name
          };
        } else {
          summary = { error: 'No driver data found' };
        }
        break;
        
      case 'getRaceCalendar':
        summary = {
          season: data.length > 0 ? data[0].season : 'Unknown',
          totalRaces: data.length,
          firstRace: data.length > 0 ? `Round ${data[0].round}: ${data[0].raceName}` : 'N/A',
          lastRace: data.length > 0 ? `Round ${data[data.length-1].round}: ${data[data.length-1].raceName}` : 'N/A'
        };
        break;
        
      case 'getCircuitInfo':
        summary = {
          circuitId: data.circuitId,
          name: data.circuitName,
          location: data.Location ? `${data.Location.locality}, ${data.Location.country}` : 'Unknown',
          coordinates: data.Location ? `Lat: ${data.Location.lat}, Long: ${data.Location.long}` : 'Unknown'
        };
        break;
        
      case 'getQualifyingResults':
        summary = {
          raceName: data.raceName,
          season: data.season,
          round: data.round,
          poleSitter: data.QualifyingResults && data.QualifyingResults.length > 0 ? 
            `${data.QualifyingResults[0].Driver.givenName} ${data.QualifyingResults[0].Driver.familyName} (${data.QualifyingResults[0].Q3 || data.QualifyingResults[0].Q2 || data.QualifyingResults[0].Q1})` : 'N/A',
          totalParticipants: data.QualifyingResults ? data.QualifyingResults.length : 0
        };
        break;
        
      case 'getDriverInformation':
        summary = {
          driverId: data.driverId,
          name: `${data.givenName} ${data.familyName}`,
          number: data.permanentNumber,
          nationality: data.nationality,
          dateOfBirth: data.dateOfBirth
        };
        break;
        
      case 'getConstructorInformation':
        summary = {
          constructorId: data.constructorId,
          name: data.name,
          nationality: data.nationality
        };
        break;
        
      default:
        // For other endpoints or if no specific handling, just return basic info
        if (Array.isArray(data)) {
          summary = {
            type: 'Array',
            count: data.length,
            firstItem: data.length > 0 ? 'Present' : 'None',
            sample: data.length > 0 ? Object.keys(data[0]).join(', ') : 'N/A'
          };
        } else if (typeof data === 'object') {
          summary = {
            type: 'Object',
            keys: Object.keys(data),
            dataPresent: Object.keys(data).length > 0 ? 'Yes' : 'No'
          };
        } else {
          summary = { data };
        }
    }
  } catch (error) {
    summary = { error: 'Error creating summary', message: error.message };
  }
  
  return summary;
}

main(); 