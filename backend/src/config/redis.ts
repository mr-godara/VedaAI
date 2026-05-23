import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableOfflineQueue: false, // Fail fast instead of hanging if Redis drops
  keepAlive: 10000, // Prevent Upstash from closing idle connections
  family: 0, // Automatically use IPv4 or IPv6
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});
