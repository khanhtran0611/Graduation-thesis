import { getRedisClient } from "../config/redis";

class RedisServices {
  async createItem(user_id: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) {
      throw new Error("Redis client is not initialized");
    }
    await redis.set(user_id, "0");
  }

  async getValue(user_id: string): Promise<number | null> {
    const redis = getRedisClient();
    if (!redis) {
      throw new Error("Redis client is not initialized");
    }

    const value = await redis.get(user_id);
    if (value === null) {
      return null;
    }

    return Number(value);
  }

  async incrementValue(user_id: string): Promise<number> {
    const redis = getRedisClient();
    if (!redis) {
      throw new Error("Redis client is not initialized");
    }

    return redis.incr(user_id);
  }
}

export default new RedisServices();
