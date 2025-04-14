declare module "@modelcontextprotocol/sdk" {
  export interface Request {
    id?: number;
    method?: string;
    params?: any;
  }

  export interface Notification {
    method: string;
    params?: any;
  }

  export interface Result {
    content?: any;
  }

  export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
    outputSchema?: any;
  }

  export class McpError extends Error {
    constructor(code: ErrorCode, message: string);
  }

  export enum ErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
  }

  export interface ServerOptions {
    name: string;
    version: string;
  }

  export class Server<
    TRequest = Request,
    TNotification = Notification,
    TResult = Result
  > {
    constructor(options: ServerOptions);
    tools: {
      register(
        name: string,
        tool: {
          description: string;
          inputSchema: any;
          outputSchema?: any;
          handler: (params: any) => Promise<any>;
        }
      ): void;
    };
    listen(transport: any): Promise<void>;
  }

  export class StdioTransport {
    constructor();
  }
}
