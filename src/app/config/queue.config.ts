import { ConnectionOptions } from 'bullmq';
import config from '.';

export const redisConnection: ConnectionOptions = {
  host: config.UPSTASH_REDIS_HOST!,
  port: 6379,
  password: config.UPSTASH_REDIS_REST_TOKEN,
  tls: {},
  maxRetriesPerRequest: null,
};
