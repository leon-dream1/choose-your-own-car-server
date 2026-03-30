import redisClient from '../config/redis.config';

export const CACHE_TTL = {
  CAR_LIST: 60 * 5,
  CAR_DETAIL: 60 * 10,
};

export const setCache = async (
  key: string,
  data: unknown,
  ttl: number
): Promise<void> => {
  await redisClient.set(key, JSON.stringify(data), { ex: ttl });
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redisClient.get(key);

  if (!data) return null;

  if (typeof data === 'string') {
    return JSON.parse(data) as T;
  }

  return data as T;
};

export const deleteCache = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

export const deleteCacheByPattern = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redisClient.del(key)));
  }
};

export const buildCacheKey = (
  prefix: string,
  query: Record<string, unknown>
): string => {
  const sortedQuery = Object.keys(query)
    .sort()
    .map((key) => `${key}=${query[key]}`)
    .join('&');

  return `${prefix}:${sortedQuery}`;
};
