# Stop on error
$ErrorActionPreference = "Stop"

Write-Host "Setting up F1 MCP development environment..."

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate

# Install dependencies
Write-Host "Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
Write-Host "Creating project directories..."
New-Item -ItemType Directory -Force -Path fastf1_cache | Out-Null
New-Item -ItemType Directory -Force -Path logs | Out-Null

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..."
    Copy-Item .env.example .env
}

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
}

Write-Host "`nSetup complete! You can now run the server with:"
Write-Host "python -m f1_mcp_server.main" 