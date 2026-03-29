import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import config from '../config';
import { verifyToken } from '../utils/token';
import httpStatus from 'http-status';
import { TRole } from '../modules/User/user.constant';
import { User } from '../modules/User/user.model';

const auth = (...roles: TRole[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) throw new AppError(401, 'You are not authorized!');

    const decoded = verifyToken(token, config.jwt_access_secret as string);

    const user = await User.findOne({ email: decoded.email });
    if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    if (user.isBlocked)
      throw new AppError(httpStatus.FORBIDDEN, 'Your account is blocked!');
    if (!user.isVerified)
      throw new AppError(httpStatus.FORBIDDEN, 'Please verify your email!');

    if (roles.length && !roles.includes(decoded.role as TRole)) {
      throw new AppError(httpStatus.FORBIDDEN, 'Forbidden!');
    }

    req.user = decoded;
    next();
  });

export default auth;
