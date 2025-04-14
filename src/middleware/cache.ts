import { Request } from "@modelcontextprotocol/sdk";

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string; // Prefix for cache keys
}

class Cache {
  private store: Map<string, CacheEntry>;
  private defaultTTL: number;
  private keyPrefix: string;

  constructor(config: CacheConfig = {}) {
    this.store = new Map();
    this.defaultTTL = config.ttl || 300; // Default 5 minutes
    this.keyPrefix = config.keyPrefix || "mcp:";
  }

  private generateKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  set(key: string, value: any, ttl?: number): void {
    const cacheKey = this.generateKey(key);
    this.store.set(cacheKey, {
      data: value,
      timestamp: Date.now() + (ttl || this.defaultTTL) * 1000,
    });
  }

  get(key: string): any | null {
    const cacheKey = this.generateKey(key);
    const entry = this.store.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.timestamp) {
      this.store.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.store.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.timestamp) {
        this.store.delete(key);
      }
    }
  }
}

// Create cache instance
const cache = new Cache();

// Run cleanup every minute
setInterval(() => cache.cleanup(), 60000);

export const cacheMiddleware = (config: CacheConfig = {}) => {
  return async (request: Request, next: () => Promise<any>) => {
    // Only cache GET requests
    if (request.method?.toLowerCase() !== "get") {
      return next();
    }

    // Generate cache key from request
    const cacheKey = `${request.method}:${JSON.stringify(request.params)}`;

    // Try to get from cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.info(`Cache hit for key: ${cacheKey}`);
      return cachedResult;
    }

    // Execute request
    const result = await next();

    // Cache the result
    cache.set(cacheKey, result, config.ttl);
    console.info(`Cached result for key: ${cacheKey}`);

    return result;
  };
};
