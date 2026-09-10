// src/config/get-redis-client.upstash.ts
import { Redis } from "@upstash/redis";

let redisStore: Redis | null = null;

import { env } from "./env";

const getRedisClient = (): Redis => {
    if (!redisStore) {
        redisStore = new Redis({
            url: env.UPSTASH_REDIS_REST_URL,
            token: env.UPSTASH_REDIS_REST_TOKEN,
        });
    }

    return redisStore;
};

export default getRedisClient;