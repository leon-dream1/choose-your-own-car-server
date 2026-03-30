import { ConnectionOptions } from 'bullmq';
import config from '.';

export const redisConnection: ConnectionOptions = {
  host: config.UPSTASH_REDIS_HOST!,
  port: Number(config.UPSTASH_REDIS_PORT),
  password: config.UPSTASH_REDIS_REST_TOKEN,
  tls: {},
};
