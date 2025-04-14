import { McpError, ErrorCode, Request } from "@modelcontextprotocol/sdk";

export const errorHandlerMiddleware = async (request: Request, next: () => Promise<any>) => {
  try {
    return await next();
  } catch (error) {
    console.error(`Error handling request: ${error instanceof Error ? error.message : String(error)}`);

    // If it's already an MCP error, just rethrow it
    if (error instanceof McpError) {
      throw error;
    }

    // Map common error types to appropriate MCP error codes
    if (error instanceof TypeError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.message}`
      );
    }

    if (error instanceof SyntaxError) {
      throw new McpError(
        ErrorCode.ParseError,
        `Failed to parse request: ${error.message}`
      );
    }

    // For unknown errors, return a generic internal error
    throw new McpError(
      ErrorCode.InternalError,
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}; 