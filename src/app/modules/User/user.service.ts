/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from './user.model';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import config from '../../config';
import { TUser } from './user.interface';
import AppError from '../../errors/AppError';
import { createToken, verifyToken } from '../../utils/token';
import {
  storeEmailVerificationToken,
  storeResetPasswordVerificationToken,
  verifyStoredEmailVerificationToken,
  verifyStoreResetPasswordVerificationTokenn,
} from '../../redis/verifyEmailAndResetPassword';
import { addResetPasswordJob, addVerifyEmailJob } from '../../redis/emailJob';
import { Car } from '../Car/car.model';

const saveUserToDB = async (userData: TUser) => {
  const isUserExists = await User.findOne({ email: userData?.email });

  if (isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User Already Exists');
  }

  const user = await User.create(userData);
  const token = await storeEmailVerificationToken(user.email);

  const link = `http://localhost:5000/api/auth/verify?email=${user.email}&token=${token}`;

  await addVerifyEmailJob(user.email, link);

  return { message: 'A verification email has been sent!' };
};

const verifyEmail = async (email: string, token: string) => {
  const isValid = await verifyStoredEmailVerificationToken(email, token);

  if (!isValid) {
    throw new AppError(400, 'Invalid or expired verification link');
  }
  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  );

  if (!user) throw new AppError(404, 'User not found');
  return { message: 'Email verified successfully!' };
};

const loginUserToDB = async (
  email: string,
  password: string,
  deviceInfo: string
) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError(401, 'Invalid credentials!');
  if (user.isBlocked) throw new AppError(401, 'Your account is blocked!');
  if (!user.isVerified)
    throw new AppError(401, 'Please verify your email first!');

  const passwordMatched = await bcrypt.compare(password, user.password);
  if (!passwordMatched) throw new AppError(401, 'Invalid credentials!');

  const payload = {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const accessToken = createToken(
    payload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in!
  );

  const refreshToken = createToken(
    payload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in!
  );

  user.sessions.push({ refreshToken, deviceInfo, createdAt: new Date() });
  await user.save();

  return { accessToken, refreshToken };
};

const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyToken(
    refreshToken,
    config.jwt_refresh_secret as string
  );

  const user = await User.findOne({ email: decoded.email });
  if (!user || user.isBlocked) throw new AppError(401, 'Unauthorized');

  const sessionExists = user.sessions.find(
    (s) => s.refreshToken === refreshToken
  );
  if (!sessionExists)
    throw new AppError(401, 'Session expired, please login again');

  const payload = {
    _id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const accessToken = createToken(
    payload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in!
  );

  return accessToken;
};

const logoutUser = async (refreshToken: string) => {
  const user = await User.findOneAndUpdate(
    { 'sessions.refreshToken': refreshToken },
    { $pull: { sessions: { refreshToken } } },
    { new: true }
  );

  if (!user) throw new AppError(400, 'Session not found');

  return { message: 'Logged out successfully' };
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find({ role: { $ne: 'admin' } })
      .select('-password -sessions')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments({ role: { $ne: 'admin' } }),
  ]);
  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// const blockUser = async (targetId: string, requesterId: string) => {
//   if (targetId === requesterId) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'You cannot block yourself');
//   }

//   const target = await User.findById(targetId);
//   if (!target) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

//   if (target.role === 'admin') {
//     throw new AppError(httpStatus.FORBIDDEN, 'Cannot block an admin');
//   }

//   target.isBlocked = true;
//   await target.save();

//   return { message: `${target.name} has been blocked` };
// };

const toggleBlockUser = async (targetId: string, requesterId: string) => {
  if (targetId === requesterId) {
    throw new AppError(400, 'You cannot block yourself');
  }

  const target = await User.findById(targetId);
  if (!target) throw new AppError(404, 'User not found');
  if (target.role === 'admin') {
    throw new AppError(403, 'Cannot block an admin');
  }

  target.isBlocked = !target.isBlocked; // toggle
  await target.save();

  return {
    message: target.isBlocked
      ? `${target.name} has been blocked`
      : `${target.name} has been unblocked`,
    isBlocked: target.isBlocked,
  };
};

const updateRole = async (
  targetId: string,
  requesterId: string,
  newRole: 'user' | 'seller'
) => {
  if (targetId === requesterId) {
    throw new AppError(400, 'You cannot change your own role');
  }

  const target = await User.findById(targetId);
  if (!target) throw new AppError(404, 'User not found');

  if (target.role === 'admin') {
    throw new AppError(403, 'Cannot change admin role');
  }
  if (target.role === newRole) {
    throw new AppError(400, `User is already a ${newRole}`);
  }

  target.role = newRole;
  await target.save();

  return { message: `${target.name} is now a ${newRole}` };
};

const deleteUser = async (targetId: string) => {
  const target = await User.findById(targetId);
  if (!target) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  if (target.role === 'admin')
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot delete an admin');

  await User.findByIdAndDelete(targetId);
  return { message: 'User deleted successfully' };
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return { message: 'If this email exists, a reset link has been sent.' };
  }

  if (user.isBlocked) {
    throw new AppError(403, 'Your account is blocked!');
  }

  const token = await storeResetPasswordVerificationToken(email);

  const resetLink = `http://localhost:3000/api/auth/reset-password?email=${email}&token=${token}`;

  await addResetPasswordJob(email, resetLink);

  return { message: 'If this email exists, a reset link has been sent.' };
};

const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  const isValid = await verifyStoreResetPasswordVerificationTokenn(
    email,
    token
  );

  if (!isValid) {
    throw new AppError(
      400,
      'Invalid or expired reset link. Please request again.'
    );
  }

  const user = await User.findOne({ email });
  if (!user) throw new AppError(404, 'User not found');

  user.password = newPassword;
  user.sessions = [];

  await user.save();

  return { message: 'Password reset successfully! Please login again.' };
};

const toggleWishlist = async (userId: string, carId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(404, 'User not found');

  const car = await Car.findById(carId);
  if (!car) throw new AppError(404, 'Car not found');
  if (car.status !== 'approved') {
    throw new AppError(400, 'Car is not available');
  }

  const isInWishlist = user.wishlist.map((id) => id.toString()).includes(carId);

  if (isInWishlist) {
    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: carId },
    });
    return { message: 'Removed from wishlist', isWishlisted: false };
  } else {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: carId },
    });
    return { message: 'Added to wishlist', isWishlisted: true };
  }
};

const getMyWishlist = async (userId: string) => {
  const user = await User.findById(userId)
    .populate({
      path: 'wishlist',
      match: { status: 'approved' },
      select: 'title brand model year price coverImage location condition',
    })
    .select('wishlist')
    .lean();

  if (!user) throw new AppError(404, 'User not found');

  return user.wishlist;
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-password -sessions').lean();
  if (!user) throw new AppError(404, 'User not found');
  return user;
};

// const updateMe = async (userId: string, updateData: Partial<TUser>) => {
//   const notAllowed = ['role', 'isBlocked', 'isVerified', 'password', 'email'];
//   notAllowed.forEach((field) => delete (updateData as any)[field]);

//   const user = await User.findByIdAndUpdate(userId, updateData, {
//     new: true,
//     runValidators: true,
//   }).select('-password -sessions');

//   if (!user) throw new AppError(404, 'User not found');
//   return user;
// };

export const userServices = {
  saveUserToDB,
  verifyEmail,
  loginUserToDB,
  refreshAccessToken,
  logoutUser,
  getAllUsers,
  // blockUser,
  toggleBlockUser,
  deleteUser,
  resetPassword,
  forgotPassword,
  updateRole,
  getMyWishlist,
  toggleWishlist,
  getMe,
  // updateMe,
};
