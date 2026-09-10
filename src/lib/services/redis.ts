import { redis } from "@/config/get-redis-server.upstash";

/**
 * Rate limits requests based on a unique identifier (like IP).
 * Uses a simple fixed window approach.
 * 
 * @param identifier Unique ID (e.g., IP address or email)
 * @param limit Max number of requests allowed in the window
 * @param windowInSeconds Duration of the rate limit window
 * @returns boolean indicating if the request is allowed
 */
export async function rateLimit(identifier: string, limit = 5, windowInSeconds = 60): Promise<boolean> {
  try {
    const key = `noukahishab:ratelimit:${identifier}`;
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, windowInSeconds);
    }

    return requests <= limit;
  } catch (error) {
    console.error("Redis rate limit error:", error);
    // In case of Redis failure, we default to allowing the request to avoid blocking users
    // Alternatively, could return false to block, depending on strictness required.
    return true; 
  }
}
