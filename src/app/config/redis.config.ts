import { Redis } from '@upstash/redis';
import config from '.';

const redisClient = new Redis({
  url: config.UPSTASH_REDIS_REST_URL!,
  token: config.UPSTASH_REDIS_REST_TOKEN!,
});

console.log(config.UPSTASH_REDIS_REST_URL, config.UPSTASH_REDIS_REST_TOKEN);
export default redisClient;
