# Create the config directory if it doesn't exist
$configDir = "$env:USERPROFILE\.cursor"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force
}

# Create the MCP configuration
$config = @{
    mcpServers = @{
        'mcp-installer' = @{
            command = 'npx @anaisbetts/mcp-installer'
            enabled = $true
        }
        'server-github' = @{
            command = 'npx @modelcontextprotocol/server-github -y'
            enabled = $true
        }
        'f1-mcp-server' = @{
            command = 'node build/index.js'
            cwd = Join-Path $PWD 'f1-mcp-server-node'
            enabled = $true
            env = @{
                NODE_ENV = 'development'
            }
        }
    }
}

# Convert to JSON and save
$configJson = $config | ConvertTo-Json -Depth 10
Set-Content -Path "$configDir\mcp.json" -Value $configJson -Force

Write-Host "MCP configuration has been installed successfully."
Write-Host "Configuration location: $configDir\mcp.json" 