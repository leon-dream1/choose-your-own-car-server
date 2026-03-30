import { Ratelimit } from '@upstash/ratelimit';

import redisClient from '../config/redis.config';
import { NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError';

export const registerRateLimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'ratelimit:register',
});

export const loginRateLimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  prefix: 'ratelimit:login',
});

export const forgetPasswordRateLimit = new Ratelimit({
  redis: redisClient,
  limiter: Ratelimit.slidingWindow(3, '15 m'),
  prefix: 'ratelimit:forget-password',
});

export const registerLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    console.log('ip', ip);

    const { success, limit, remaining, reset } =
      await registerRateLimit.limit(ip);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      throw new AppError(
        429,
        'Too many requests! Please wait 1 minute and try again.'
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const loginLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    const { success, limit, remaining, reset } = await loginRateLimit.limit(ip);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      throw new AppError(
        429,
        'Too many login attempts! Please wait 15 minutes.'
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    const { success, limit, remaining, reset } =
      await forgetPasswordRateLimit.limit(ip);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', reset);

    if (!success) {
      throw new AppError(
        429,
        'Too many login attempts! Please wait 15 minutes.'
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
