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
  appendFileSync('mcp-test-results.log', logMessage + '\n');
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
    writeFileSync('mcp-test-results.log', '--- F1 MCP SERVER TEST RESULTS ---\n\n');
    
    log('Starting F1 MCP Server tests...');
    
    // Create a process communicator for the MCP server
    const serverPath = path.resolve('../f1-mcp-server-node/build/index.js');
    log('[INFO] Server path:', serverPath);
    const client = new McpProcessCommunicator('node', [serverPath]);
    
    // Initialize the server following the MCP protocol
    log('Initializing MCP server...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give process time to start
    
    // Step 1: Initialize the connection with the server
    try {
      log('Initializing MCP protocol...');
      const initResult = await client.sendRequest('initialize', {
        protocolVersion: '0.5.0',
        clientInfo: {
          name: 'f1-mcp-test-client',
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
      
      // Step 2: List available tools
      log('Listing available tools...');
      const toolsResult = await client.sendRequest('tools/list', {});
      log('Available tools:', toolsResult);
      
      // Run all tests in sequence
      await runTests(client);
      
      log('All tests completed!');
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

async function runTests(client) {
  const tests = [
    // Test original tools
    {
      name: "Getting current session status",
      method: "tools/call",
      params: { name: "getCurrentSessionStatus", arguments: {} }
    },
    {
      name: "Getting driver standings for 2023",
      method: "tools/call",
      params: { name: "getDriverStandings", arguments: { year: 2023 } }
    },
    {
      name: "Getting constructor standings for 2023",
      method: "tools/call",
      params: { name: "getConstructorStandings", arguments: { year: 2023 } }
    },
    {
      name: "Getting historic race results for 2023 Abu Dhabi GP",
      method: "tools/call",
      params: { name: "getHistoricRaceResults", arguments: { year: 2023, round: 22 } }
    },
    {
      name: "Getting driver info for Max Verstappen",
      method: "tools/call",
      params: { name: "getDriverInfo", arguments: { driverId: "1" } }
    },
    
    // Test new OpenF1 tools
    {
      name: "Getting weather data",
      method: "tools/call",
      params: { name: "getWeatherData", arguments: {} }
    },
    {
      name: "Getting car data for Lewis Hamilton",
      method: "tools/call",
      params: { name: "getCarData", arguments: { driverNumber: "44" } }
    },
    {
      name: "Getting pit stop data",
      method: "tools/call",
      params: { name: "getPitStopData", arguments: {} }
    },
    {
      name: "Getting team radio data",
      method: "tools/call",
      params: { name: "getTeamRadio", arguments: {} }
    },
    {
      name: "Getting race control messages",
      method: "tools/call",
      params: { name: "getRaceControlMessages", arguments: {} }
    },
    
    // Test new Ergast API tools
    {
      name: "Getting 2023 race calendar",
      method: "tools/call",
      params: { name: "getRaceCalendar", arguments: { year: 2023 } }
    },
    {
      name: "Getting circuit info for Monza",
      method: "tools/call",
      params: { name: "getCircuitInfo", arguments: { circuitId: "monza" } }
    },
    {
      name: "Getting season list",
      method: "tools/call",
      params: { name: "getSeasonList", arguments: { limit: 5 } }
    },
    {
      name: "Getting qualifying results for 2023 Monaco GP",
      method: "tools/call",
      params: { name: "getQualifyingResults", arguments: { year: 2023, round: 7 } }
    },
    {
      name: "Getting detailed driver information for Hamilton",
      method: "tools/call",
      params: { name: "getDriverInformation", arguments: { driverId: "hamilton" } }
    },
    {
      name: "Getting constructor information for Ferrari",
      method: "tools/call",
      params: { name: "getConstructorInformation", arguments: { constructorId: "ferrari" } }
    },
    
    // Test utility functions
    {
      name: "Clearing cache",
      method: "tools/call",
      params: { name: "clearCache", arguments: {} }
    }
  ];
  
  // Run each test with a delay between them
  for (const test of tests) {
    log(`Test: ${test.name}...`);
    try {
      const result = await client.sendRequest(test.method, test.params);
      log(`${test.name} result:`, result);
    } catch (error) {
      log(`[ERROR] ${test.name} test failed:`, error);
    }
    
    // Wait between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main(); 