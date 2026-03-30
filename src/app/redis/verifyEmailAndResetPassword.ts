import crypto from 'crypto';
import redisClient from '../config/redis.config';

const VERIFY_EMAIL_TOKEN_EXPIRY_SECONDS = 60 * 10;
const RESET_PASSWORD_TOKEN_EXPIRY_SECONDS = 60 * 15;

export const storeEmailVerificationToken = async (
  email: string
): Promise<string | null> => {
  const token = crypto.randomBytes(32).toString('hex');

  await redisClient.set(`verify:${email}`, token, {
    ex: VERIFY_EMAIL_TOKEN_EXPIRY_SECONDS,
  });
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

export const storeResetPasswordVerificationToken = async (
  email: string
): Promise<string | null> => {
  const token = crypto.randomBytes(32).toString('hex');

  await redisClient.set(`reset:${email}`, token, {
    ex: RESET_PASSWORD_TOKEN_EXPIRY_SECONDS,
  });
  return token;
};

export const verifyStoreResetPasswordVerificationTokenn = async (
  email: string,
  token: string
): Promise<boolean> => {
  const storedToken = await redisClient.get(`reset:${email}`);
  if (!storedToken) return false;

  if (storedToken !== token) return false;

  await redisClient.del(`reset:${email}`);

  return true;
};
