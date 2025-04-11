# Development Guide

## Setup Development Environment

1. Clone the repository:
```bash
git clone https://github.com/yourusername/f1-mcp.git
cd f1-mcp
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Project Structure

```
f1_mcp/
├── f1_mcp_server/              # Main package directory
│   ├── api/                    # API layer
│   │   ├── routes/            # API route definitions
│   │   └── models/            # API request/response models
│   ├── core/                  # Core business logic
│   ├── data_models/          # Domain models
│   ├── adapters/             # External service adapters
│   ├── websocket/           # WebSocket functionality
│   ├── analytics/           # Analytics and data processing
│   └── utils/              # Utility functions
├── tests/                  # Test suite
├── docs/                  # Documentation
└── scripts/              # Utility scripts
```

## Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and write tests

3. Run tests:
```bash
pytest tests/
```

4. Run linting:
```bash
flake8 f1_mcp_server tests
```

5. Format code:
```bash
black f1_mcp_server tests
```

6. Commit your changes:
```bash
git add .
git commit -m "Description of changes"
```

7. Push your changes:
```bash
git push origin feature/your-feature-name
```

## Testing

### Running Tests

Run all tests:
```bash
pytest tests/
```

Run specific test file:
```bash
pytest tests/functional/test_telemetry.py
```

Run with coverage:
```bash
pytest --cov=f1_mcp_server tests/
```

### Test Structure

- `tests/unit/`: Unit tests for individual components
- `tests/integration/`: Integration tests
- `tests/functional/`: End-to-end functional tests

## Docker Development

Build and run with Docker:
```bash
docker-compose up --build
```

Run tests in Docker:
```bash
docker-compose run f1_mcp pytest tests/
```

## API Development

When adding new endpoints:

1. Define request/response models in `api/models/`
2. Implement business logic in `core/`
3. Create route handler in `api/routes/`
4. Add tests
5. Update API documentation

## Best Practices

1. Follow PEP 8 style guide
2. Write docstrings for all functions and classes
3. Keep functions small and focused
4. Write tests for new features
5. Update documentation
6. Use type hints
7. Handle errors gracefully

## Common Issues

### Cache Issues
- Clear FastF1 cache: `rm -rf fastf1_cache/*`
- Rebuild Docker cache: `docker-compose build --no-cache`

### Connection Issues
- Check FastF1 API status
- Verify network connectivity
- Check rate limits

## Deployment

1. Build Docker image:
```bash
docker build -t f1-mcp .
```

2. Run container:
```bash
docker run -p 8000:8000 f1-mcp
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

## Code Review Guidelines

1. Check for test coverage
2. Verify documentation updates
3. Review error handling
4. Check performance implications
5. Verify API consistency 