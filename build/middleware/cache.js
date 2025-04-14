class Cache {
    constructor(config = {}) {
        this.store = new Map();
        this.defaultTTL = config.ttl || 300; // Default 5 minutes
        this.keyPrefix = config.keyPrefix || 'mcp:';
    }
    generateKey(key) {
        return `${this.keyPrefix}${key}`;
    }
    set(key, value, ttl) {
        const cacheKey = this.generateKey(key);
        this.store.set(cacheKey, {
            data: value,
            timestamp: Date.now() + (ttl || this.defaultTTL) * 1000
        });
    }
    get(key) {
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
    clear() {
        this.store.clear();
    }
    cleanup() {
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
export const cacheMiddleware = (config = {}) => {
    return async (request, next) => {
        // Only cache GET requests
        if (request.method?.toLowerCase() !== 'get') {
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
