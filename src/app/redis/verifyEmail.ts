import crypto from 'crypto';
import redisClient from '../config/redis.config';

const TOKEN_EXPIRY_SECONDS = 60 * 10;

export const storeEmailVerificationToken = async (
  email: string
): Promise<string | null> => {
  const token = crypto.randomBytes(32).toString('hex');

  await redisClient.set(`verify:${email}`, token, { ex: TOKEN_EXPIRY_SECONDS });

  console.log(`Token stored in Redis for ${email}`);
  return token;
};

export const verifyStoredEmailVerificationToken = async (
  email: string,
  token: string
): Promise<boolean> => {
  const storedToken = await redisClient.get(`verify:${email}`);
  if (!storedToken) return false;

  if (storedToken !== token) return false;

  await redisClient.del(`verify:${email}`);

  return true;
};
