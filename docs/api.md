# F1 MCP API Documentation

## Overview

The F1 MCP API provides access to Formula 1 racing data through a standardized interface. All endpoints are prefixed with `/mcp/function/`.

## Authentication

Currently, the API does not require authentication but implements rate limiting of 60 requests per minute per IP address.

## Input Validation

All endpoints implement strict input validation:
- Years must be between 1950 and 2100
- Driver identifiers must be alphanumeric
- Event names cannot be empty
- Session types must be one of: "FP1", "FP2", "FP3", "Q", "Sprint", "Race"

## Endpoints

### Get MCP Context

```http
GET /mcp/context
```

Returns information about the MCP server's capabilities and available functions.

### Get Driver Standings

```http
GET /mcp/function/get_driver_standings
```

Parameters:
- `year` (optional): Year to get standings for. Defaults to current year.

Returns the current Formula 1 Driver's Championship standings.

### Get Constructor Standings

```http
GET /mcp/function/get_constructor_standings
```

Parameters:
- `year` (optional): Year to get standings for. Defaults to current year.

Returns the current Formula 1 Constructor's Championship standings.

### Get Race Calendar

```http
GET /mcp/function/get_race_calendar
```

Parameters:
- `year` (required): Year to get calendar for.

Returns the Formula 1 race calendar for the specified year.

### Get Session Results

```http
GET /mcp/function/get_session_results
```

Parameters:
- `year` (required): Year of the event (1950-2100)
- `event` (required): Event identifier (e.g., "bahrain", "monaco")
- `session` (required): Session type ("FP1", "FP2", "FP3", "Q", "Sprint", "Race")

Returns detailed results for the specified session.

### Get Driver Performance

```http
GET /mcp/function/get_driver_performance
```

Parameters:
- `year` (required): Year of the event (1950-2100)
- `event` (required): Event identifier
- `driver` (required): Driver identifier (alphanumeric)

Returns detailed performance data for a specific driver.

### Get Telemetry

```http
GET /mcp/function/get_telemetry
```

Parameters:
- `year` (required): Year of the event (1950-2100)
- `event` (required): Event identifier
- `driver` (required): Driver identifier (alphanumeric)
- `lap` (required): Lap number (>= 1)
- `page` (optional): Page number for pagination (default: 1)
- `page_size` (optional): Items per page (default: 100, max: 1000)

Returns paginated telemetry data for a specific lap.

### Compare Drivers

```http
POST /mcp/function/compare_drivers
```

Parameters:
- `year` (required): Year of the event (1950-2100)
- `event` (required): Event identifier
- `drivers` (required): List of 2-5 unique driver identifiers

Returns a comparison of the specified drivers.

### Get Weather Data

```http
GET /mcp/function/get_weather_data
```

Parameters:
- `year` (required): Year of the event (1950-2100)
- `event` (required): Event identifier

Returns weather information for a specific event.

### Get Circuit Info

```http
GET /mcp/function/get_circuit_info
```

Parameters:
- `circuit_id` (required): Circuit identifier

Returns detailed information about a specific circuit.

## Response Formats

All responses follow a standard format:

Success Response:
```json
{
    "status": "success",
    "data": {
        // Response data
    }
}
```

Error Response:
```json
{
    "status": "error",
    "message": "Error description"
}
```

Paginated Response:
```json
{
    "page": 1,
    "page_size": 100,
    "total_items": 1000,
    "total_pages": 10,
    "items": [
        // Page items
    ]
}
```

## Rate Limiting

The API implements the following limits:
- REST API: 60 requests per minute per IP address
- WebSocket: 1000 concurrent connections maximum
- Pagination: Maximum 1000 items per page

## WebSocket Support

Real-time updates are available through WebSocket connections at `/ws/{client_id}`. The server implements connection pooling with a limit of 1000 concurrent connections.

### WebSocket Events

1. Data Updates
```json
{
    "type": "update",
    "data": {
        // Live session data
    },
    "timestamp": "2024-03-02T14:30:00Z"
}
```

2. Heartbeat (every 30 seconds)
```json
{
    "type": "heartbeat",
    "timestamp": "2024-03-02T14:30:00Z"
}
```

## Error Codes

- 400: Bad Request - Invalid parameters or validation error
- 404: Not Found - Resource not found
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - Server-side error

## Best Practices

1. Use pagination for large data requests
2. Implement proper error handling
3. Honor rate limits
4. Cache responses when appropriate
5. Use specific parameters rather than fetching all data
6. Monitor WebSocket connection status and implement reconnection logic