import { createClient } from "redis";
import { env } from "../config/env.js";

const DEFAULT_TTL = 300;

export const redisClient = createClient({
  url: env.REDIS_URI,
});

redisClient.on("connect", () =>
  console.log("Redis Connected")
);

redisClient.on("error", (err) =>
  console.error("Redis Error:", err)
);

export const connectRedis = async () => {
  if (redisClient.isOpen) return;

  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis Connection Failed:", err);
  }
};

export const disconnectRedis = async () => {
  if (!redisClient.isOpen) return;

  try {
    await redisClient.quit();
  } catch (err) {
    console.error("Redis Disconnect Failed:", err);
  }
};

export const setCache = async (
  key: string,
  value: unknown,
  ttl = DEFAULT_TTL
) => {
  if (!redisClient.isOpen) return;

  try {
    await redisClient.setEx(
      key,
      ttl,
      JSON.stringify(value)
    );
  } catch (err) {
    console.error("Redis SET:", err);
  }
};

export const getCache = async <T>(
  key: string
): Promise<T | null> => {
  if (!redisClient.isOpen) return null;

  try {
    const value = await redisClient.get(key);

    return value ? (JSON.parse(value) as T) : null;
  } catch (err) {
    console.error("Redis GET:", err);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  if (!redisClient.isOpen) return;

  try {
    await redisClient.del(key);
  } catch (err) {
    console.error("Redis DEL:", err);
  }
};

export const deleteByPattern = async (
  pattern: string
) => {
  if (!redisClient.isOpen) return;

  try {
    let cursor = "0";

    do {
      const { cursor: next, keys } =
        await redisClient.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });

      cursor = next;

      if (keys.length)
        await redisClient.del(keys);

    } while (cursor !== "0");
  } catch (err) {
    console.error("Redis Pattern Delete:", err);
  }
};