import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { userServices } from './user.service';
import config from '../../config';
import AppError from '../../errors/AppError';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body;

  const result = await userServices.saveUserToDB(userData);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: result?.message,
    data: null,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, token } = req.query as { email: string; token: string };

  if (!email || !token) {
    throw new AppError(400, 'Email and token are required');
  }
  const result = await userServices.verifyEmail(email, token);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const deviceInfo = req.headers['user-agent'] || 'unknown'; // browser/device info

  const { accessToken, refreshToken } = await userServices.loginUserToDB(
    email,
    password,
    deviceInfo
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Login successful',
    data: { accessToken },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token)
    throw new AppError(httpStatus.UNAUTHORIZED, 'No refresh token found');

  const accessToken = await userServices.refreshAccessToken(token);

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: { accessToken },
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) throw new AppError(400, 'No active session found');

  await userServices.logoutUser(refreshToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllUsers();
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const targetId = req.params.id;
  const requesterId = req.user?._id;
  const result = await userServices.blockUser(targetId, requesterId!);
  res.status(200).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
  const targetId = req.params.id;
  const requesterId = req.user?._id;
  const { role } = req.body;

  const result = await userServices.updateRole(targetId, requesterId, role);

  res.status(200).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.deleteUser(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await userServices.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, token } = req.query as { email: string; token: string };
  const { newPassword } = req.body;

  if (!email || !token) {
    throw new AppError(400, 'Email and token are required');
  }

  const result = await userServices.resetPassword(email, token, newPassword);

  res.status(200).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.toggleWishlist(
    req.user!._id,
    req.params.carId
  );
  res.status(200).json({
    success: true,
    message: result.message,
    data: { isWishlisted: result.isWishlisted },
  });
});

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getMyWishlist(req.user!._id);
  res
    .status(200)
    .json({ success: true, message: 'Wishlist retrieved', data: result });
});

export const userControllers = {
  registerUser,
  verifyEmail,
  loginUser,
  refreshToken,
  logoutUser,
  getAllUsers,
  blockUser,
  deleteUser,
  resetPassword,
  forgotPassword,
  updateRole,
  toggleWishlist,
  getMyWishlist,
};
