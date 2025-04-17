/**
 * Simple in-memory rate limiter
 * 
 * Note: This is a basic implementation suitable for development or low-traffic sites.
 * For production with multiple server instances, use a Redis-based solution or similar.
 */

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

type RateLimitOptions = {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests allowed in the time window
};

// Store for rate limiting data
const ipRequestStore: Map<string, RateLimitRecord> = new Map();

/**
 * Check if a request should be rate limited
 * @param ip IP address or other identifier
 * @param options Rate limiting options
 * @returns Object with isLimited and other metadata
 */
export function rateLimit(ip: string, options: RateLimitOptions) {
  const { interval, maxRequests } = options;
  const now = Date.now();
  
  // Clean up expired entries occasionally
  if (Math.random() < 0.01) { // 1% chance on each request
    for (const [key, record] of ipRequestStore.entries()) {
      if (now > record.resetTime) {
        ipRequestStore.delete(key);
      }
    }
  }
  
  // Get or create record for this IP
  const record = ipRequestStore.get(ip) || { count: 0, resetTime: now + interval };
  
  // If record has expired, reset it
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + interval;
  }
  
  // Increment request count
  record.count++;
  
  // Update store
  ipRequestStore.set(ip, record);
  
  // Calculate remaining requests and time to reset
  const remaining = Math.max(0, maxRequests - record.count);
  const resetTime = record.resetTime;
  const timeUntilReset = Math.max(0, resetTime - now);
  
  return {
    isLimited: record.count > maxRequests,
    remaining,
    resetTime,
    timeUntilReset,
  };
}

/**
 * Apply rate limiting to a Next.js API route
 * @param req Next.js request
 * @param options Rate limiting options
 * @returns Rate limit check result or null if no client IP found
 */
export function applyRateLimit(req: Request, options: RateLimitOptions) {
  // Get client IP from headers
  // In a real application, you'd need to ensure these headers are properly set by your reverse proxy
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') ||
             '127.0.0.1'; // Fallback
  
  if (!ip) {
    return null;
  }
  
  return rateLimit(ip, options);
}
