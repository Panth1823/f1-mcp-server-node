import { spawn } from 'child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { McpError } from '@modelcontextprotocol/sdk/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  console.log('Starting F1 MCP Server Integration Tests...\n');
  const failures = [];
  let testCount = 0;
  let passCount = 0;

  async function runTest(name, testFn) {
    testCount++;
    try {
      process.stdout.write(`Running test: ${name}... `);
      await testFn();
      process.stdout.write('✓ Passed\n');
      passCount++;
    } catch (error) {
      process.stdout.write('✗ Failed\n');
      failures.push({
        name,
        error: error.message
      });
    }
  }

  // Test live timing data
  await runTest('Live Timing Data', async () => {
    const response = await axios.get('http://localhost:3000/api/live-timing');
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array of live timing data');
    }
  });

  // Test current session status
  await runTest('Current Session Status', async () => {
    const response = await axios.get('http://localhost:3000/api/session-status');
    if (!response.data.session_key) {
      throw new Error('Missing session key in response');
    }
  });

  // Test weather data
  await runTest('Weather Data', async () => {
    const response = await axios.get('http://localhost:3000/api/weather');
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array of weather data');
    }
  });

  // Test historical race results
  await runTest('Historical Race Results', async () => {
    const response = await axios.get('http://localhost:3000/api/results/2023/1');
    if (!response.data.raceName) {
      throw new Error('Missing race name in response');
    }
  });

  // Test driver career statistics
  await runTest('Driver Career Stats', async () => {
    const response = await axios.get('http://localhost:3000/api/driver/HAM/career');
    if (!response.data.total_races) {
      throw new Error('Missing total races in career stats');
    }
  });

  // Test telemetry data
  await runTest('Detailed Telemetry', async () => {
    const response = await axios.get('http://localhost:3000/api/telemetry/44/1');
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array of telemetry data');
    }
  });

  // Test sector analysis
  await runTest('Sector Analysis', async () => {
    const response = await axios.get('http://localhost:3000/api/sectors/1234/1');
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array of sector data');
    }
  });

  // Test tyre strategy
  await runTest('Tyre Strategy', async () => {
    const response = await axios.get('http://localhost:3000/api/tyres/1234/44');
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array of tyre strategy data');
    }
  });

  // Test battle analysis
  await runTest('Battle Analysis', async () => {
    const response = await axios.get('http://localhost:3000/api/battle/1234/44/33/1');
    if (!response.data.driver1 || !response.data.driver2) {
      throw new Error('Missing driver data in battle analysis');
    }
  });

  // Test qualifying analysis
  await runTest('Qualifying Analysis', async () => {
    const response = await axios.get('http://localhost:3000/api/qualifying/1234');
    if (!Array.isArray(response.data)) {
      throw new Error('Expected array of qualifying data');
    }
  });

  // Print test results
  console.log('\nTest Results:');
  console.log(`Total Tests: ${testCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failures.length}`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    failures.forEach(failure => {
      console.log(`\n${failure.name}:`);
      console.log(failure.error);
    });
    process.exit(1);
  }
}

main(); 