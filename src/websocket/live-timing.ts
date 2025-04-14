import axios from "axios";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk";

export class F1DataService {
  private static instance: F1DataService;
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  private constructor() {}

  public static getInstance(): F1DataService {
    if (!F1DataService.instance) {
      F1DataService.instance = new F1DataService();
    }
    return F1DataService.instance;
  }

  private getCachedData<T>(key: string): T | null {
    const cachedItem = this.cache.get(key);
    if (cachedItem && cachedItem.expiry > Date.now()) {
      return cachedItem.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttl?: number): void {
    const expiry = ttl ? Date.now() + ttl * 1000 : Infinity;
    this.cache.set(key, { data, expiry });
  }

  private async fetchWithErrorHandling<T>(
    url: string,
    errorMessage: string,
    useCache: boolean = true,
    cacheTTL?: number
  ): Promise<T> {
    const cacheKey = url;

    if (useCache) {
      const cachedData = this.getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const response = await axios.get<T>(url);

      if (useCache) {
        this.setCachedData(cacheKey, response.data, cacheTTL);
      }

      return response.data;
    } catch (error: any) {
      console.error(`${errorMessage}:`, error);
      throw new McpError(
        ErrorCode.InternalError,
        `${errorMessage}: ${error.response?.status || "Unknown error"}`
      );
    }
  }
}
