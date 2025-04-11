import { WebSocketServer, WebSocket, MessageEvent } from 'ws';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

interface LiveTimingClient {
  ws: WebSocket;
  sessionId: string;
}

class LiveTimingServer {
  private clients: Set<LiveTimingClient>;
  private updateInterval: NodeJS.Timeout | null;
  private wss: WebSocketServer | null;

  constructor() {
    this.clients = new Set();
    this.updateInterval = null;
    this.wss = null;
  }

  start(port: number = 8080) {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (data) => {
        try {
          const parsedData = JSON.parse(data.toString());
          if (parsedData.type === 'subscribe' && parsedData.sessionId) {
            this.addClient(ws, parsedData.sessionId);
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.addEventListener('close', () => {
        this.removeClient(ws);
      });
    });

    this.startUpdateLoop();
  }

  private addClient(ws: WebSocket, sessionId: string) {
    this.clients.add({ ws, sessionId });
  }

  private removeClient(ws: WebSocket) {
    for (const client of this.clients) {
      if (client.ws === ws) {
        this.clients.delete(client);
        break;
      }
    }
  }

  private startUpdateLoop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.broadcastUpdates();
    }, 1000); // Update every second
  }

  private async broadcastUpdates() {
    for (const client of this.clients) {
      try {
        const timingData = await this.getLiveTimingData(client.sessionId);
        client.ws.send(JSON.stringify({
          type: 'timing',
          data: timingData,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        client.ws.send(JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    }
  }

  private async getLiveTimingData(sessionId: string) {
    // This would be replaced with actual live timing data fetching
    // For now, return mock data
    return {
      sessionId,
      timestamp: new Date().toISOString(),
      drivers: [
        {
          number: "44",
          position: 1,
          lastLapTime: "1:23.456",
          gap: "+0.000"
        }
        // Add more mock driver data as needed
      ]
    };
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }
}

export const liveTimingServer = new LiveTimingServer(); 