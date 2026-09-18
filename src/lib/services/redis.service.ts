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

/**
 * Checks if a specific action is currently in cooldown.
 * 
 * @param action The action being rate-limited (e.g. 'otp_send')
 * @param identifier Unique ID (e.g. email or user ID)
 * @returns boolean indicating if the action is currently in cooldown (blocked)
 */
export async function isInCooldown(action: string, identifier: string): Promise<boolean> {
  try {
    const key = `noukahishab:cooldown:${action}:${identifier}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Redis cooldown check error for ${action}:`, error);
    return false; // Fail open if Redis is down
  }
}

/**
 * Sets a cooldown for a specific action.
 * 
 * @param action The action being rate-limited (e.g. 'otp_send')
 * @param identifier Unique ID (e.g. email or user ID)
 * @param windowInSeconds Duration of the cooldown
 */
export async function setCooldown(action: string, identifier: string, windowInSeconds: number): Promise<void> {
  try {
    const key = `noukahishab:cooldown:${action}:${identifier}`;
    await redis.setex(key, windowInSeconds, "true");
  } catch (error) {
    console.error(`Redis set cooldown error for ${action}:`, error);
  }
}


