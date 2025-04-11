# Stop on error
$ErrorActionPreference = "Stop"

# Activate virtual environment
Write-Host "Activating virtual environment..."
.\venv\Scripts\Activate

# Run linting
Write-Host "`nRunning linting..."
flake8 f1_mcp_server tests

# Run type checking
Write-Host "`nRunning type checking..."
mypy f1_mcp_server

# Run tests with coverage
Write-Host "`nRunning tests with coverage..."
pytest tests/ --cov=f1_mcp_server --cov-report=html --cov-report=term-missing

# Run security checks
Write-Host "`nRunning security checks..."
bandit -r f1_mcp_server

Write-Host "`nAll tests completed!" 