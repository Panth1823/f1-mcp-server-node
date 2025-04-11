import { Request, Response, NextFunction } from 'express';

export interface McpRequest {
  id?: string | number;
  method?: string;
  params?: any;
}

interface RateLimitEntry {
  count: number;
  lastRequest: number;
}

const rateLimits = new Map<string, RateLimitEntry>();
const MAX_REQUESTS_PER_MINUTE = 60;

// Cleanup old entries every minute
let cleanupInterval: NodeJS.Timeout | null = null;

const startCleanupInterval = () => {
  if (cleanupInterval) return; // Don't create multiple intervals
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [clientId, entry] of rateLimits.entries()) {
      if (now - entry.lastRequest > 60000) {
        rateLimits.delete(clientId);
      }
    }
  }, 60000);

  // Prevent the timer from keeping the process alive
  cleanupInterval.unref();
};

export const clearInterval = () => {
  if (cleanupInterval) {
    global.clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

// Start the cleanup interval when the module is loaded
startCleanupInterval();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientId = req.headers['x-client-id'] as string;
  if (!clientId) {
    console.error('No client ID provided');
    return res.status(400).json({ error: 'Client ID is required' });
  }

  const now = Date.now();
  const entry = rateLimits.get(clientId);

  if (!entry) {
    rateLimits.set(clientId, { count: 1, lastRequest: now });
  } else {
    // Reset count if more than a minute has passed
    if (now - entry.lastRequest > 60000) {
      entry.count = 1;
    } else {
      entry.count++;
    }
    entry.lastRequest = now;

    if (entry.count > MAX_REQUESTS_PER_MINUTE) {
      console.error(`Rate limit exceeded for client ${clientId}`);
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
  }

  next();
}; 