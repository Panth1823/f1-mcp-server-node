import axios from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk';
export class F1DataService {
    constructor() {
        this.cache = new Map();
    }
    static getInstance() {
        if (!F1DataService.instance) {
            F1DataService.instance = new F1DataService();
        }
        return F1DataService.instance;
    }
    getCachedData(key) {
        const cachedItem = this.cache.get(key);
        if (cachedItem && cachedItem.expiry > Date.now()) {
            return cachedItem.data;
        }
        return null;
    }
    setCachedData(key, data, ttl) {
        const expiry = ttl ? Date.now() + ttl * 1000 : Infinity;
        this.cache.set(key, { data, expiry });
    }
    async fetchWithErrorHandling(url, errorMessage, useCache = true, cacheTTL) {
        const cacheKey = url;
        if (useCache) {
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }
        try {
            const response = await axios.get(url);
            if (useCache) {
                this.setCachedData(cacheKey, response.data, cacheTTL);
            }
            return response.data;
        }
        catch (error) {
            console.error(`${errorMessage}:`, error);
            throw new McpError(ErrorCode.InternalError, `${errorMessage}: ${error.response?.status || 'Unknown error'}`);
        }
    }
}
