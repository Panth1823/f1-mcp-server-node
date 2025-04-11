import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('======================================================');
console.log('F1 MCP SERVER - RUNNING ALL TESTS');
console.log('======================================================');

async function main() {
  try {
    // First run the basic tests
    console.log('\n[1/2] Running basic MCP server tests...');
    await runScript('test-mcp-server.js');
    
    // Then run the advanced parameter tests
    console.log('\n[2/2] Running advanced parameter tests...');
    await runScript('test-advanced-params.js');
    
    console.log('\n======================================================');
    console.log('All tests completed! Check log files for detailed results:');
    console.log('- Basic tests: mcp-test-results.log');
    console.log('- Advanced tests: advanced-params-test-results.log');
    console.log('======================================================');
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, scriptName);
    console.log(`Executing: ${scriptPath}`);
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Script ${scriptName} completed successfully.`);
        resolve();
      } else {
        console.error(`Script ${scriptName} failed with exit code ${code}`);
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      console.error(`Failed to start script ${scriptName}:`, err);
      reject(err);
    });
  });
}

main(); 