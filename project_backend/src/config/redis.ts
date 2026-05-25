import { createClient, RedisClientType } from "redis";
import IORedis from "ioredis";
import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || "6379";
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

// Main Redis Connection (Node-Redis)
let redisClient: RedisClientType | null = null;

export const initializeRedis = async (): Promise<void> => {
  if (redisClient?.isOpen) {
    return;
  }

  redisClient = createClient({ url: redisUrl });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });

  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
}


export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

// --- BullMQ Setup on DB 1 ---
const redisBullMQUrl = process.env.REDIS_BULLMQ_URL || `redis://${redisHost}:${redisPort}/1`;

export const bullMQRedisClient = new IORedis(redisBullMQUrl, {
  maxRetriesPerRequest: null,
});

export const pdfDeletionQueue = new Queue("pdf-deletion", {
  connection: bullMQRedisClient,
});

export const latexCompileQueue = new Queue("latex-compile", {
  connection: bullMQRedisClient,
});
