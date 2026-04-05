"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const user_model_1 = require("./user.model");
const http_status_1 = __importDefault(require("http-status"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const token_1 = require("../../utils/token");
const verifyEmailAndResetPassword_1 = require("../../redis/verifyEmailAndResetPassword");
const emailJob_1 = require("../../redis/emailJob");
const car_model_1 = require("../Car/car.model");
const saveUserToDB = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.User.findOne({ email: userData === null || userData === void 0 ? void 0 : userData.email });
    if (isUserExists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User Already Exists');
    }
    const user = yield user_model_1.User.create(userData);
    const token = yield (0, verifyEmailAndResetPassword_1.storeEmailVerificationToken)(user.email);
    const link = `http://localhost:5000/api/auth/verify?email=${user.email}&token=${token}`;
    yield (0, emailJob_1.addVerifyEmailJob)(user.email, link);
    return { message: 'A verification email has been sent!' };
});
const verifyEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const isValid = yield (0, verifyEmailAndResetPassword_1.verifyStoredEmailVerificationToken)(email, token);
    if (!isValid) {
        throw new AppError_1.default(400, 'Invalid or expired verification link');
    }
    const user = yield user_model_1.User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
    if (!user)
        throw new AppError_1.default(404, 'User not found');
    return { message: 'Email verified successfully!' };
});
const loginUserToDB = (email, password, deviceInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email }).select('+password');
    if (!user)
        throw new AppError_1.default(401, 'Invalid credentials!');
    if (user.isBlocked)
        throw new AppError_1.default(401, 'Your account is blocked!');
    if (!user.isVerified)
        throw new AppError_1.default(401, 'Please verify your email first!');
    const passwordMatched = yield bcrypt_1.default.compare(password, user.password);
    if (!passwordMatched)
        throw new AppError_1.default(401, 'Invalid credentials!');
    const payload = {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
    };
    const accessToken = (0, token_1.createToken)(payload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, token_1.createToken)(payload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    user.sessions.push({ refreshToken, deviceInfo, createdAt: new Date() });
    yield user.save();
    return { accessToken, refreshToken };
});
const refreshAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, token_1.verifyToken)(refreshToken, config_1.default.jwt_refresh_secret);
    const user = yield user_model_1.User.findOne({ email: decoded.email });
    if (!user || user.isBlocked)
        throw new AppError_1.default(401, 'Unauthorized');
    const sessionExists = user.sessions.find((s) => s.refreshToken === refreshToken);
    if (!sessionExists)
        throw new AppError_1.default(401, 'Session expired, please login again');
    const payload = {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, token_1.createToken)(payload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return accessToken;
});
const logoutUser = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOneAndUpdate({ 'sessions.refreshToken': refreshToken }, { $pull: { sessions: { refreshToken } } }, { new: true });
    if (!user)
        throw new AppError_1.default(400, 'Session not found');
    return { message: 'Logged out successfully' };
});
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = yield Promise.all([
        user_model_1.User.find({ role: { $ne: 'admin' } })
            .select('-password -sessions')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        user_model_1.User.countDocuments({ role: { $ne: 'admin' } }),
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
});
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
const toggleBlockUser = (targetId, requesterId) => __awaiter(void 0, void 0, void 0, function* () {
    if (targetId === requesterId) {
        throw new AppError_1.default(400, 'You cannot block yourself');
    }
    const target = yield user_model_1.User.findById(targetId);
    if (!target)
        throw new AppError_1.default(404, 'User not found');
    if (target.role === 'admin') {
        throw new AppError_1.default(403, 'Cannot block an admin');
    }
    target.isBlocked = !target.isBlocked; // toggle
    yield target.save();
    return {
        message: target.isBlocked
            ? `${target.name} has been blocked`
            : `${target.name} has been unblocked`,
        isBlocked: target.isBlocked,
    };
});
const updateRole = (targetId, requesterId, newRole) => __awaiter(void 0, void 0, void 0, function* () {
    if (targetId === requesterId) {
        throw new AppError_1.default(400, 'You cannot change your own role');
    }
    const target = yield user_model_1.User.findById(targetId);
    if (!target)
        throw new AppError_1.default(404, 'User not found');
    if (target.role === 'admin') {
        throw new AppError_1.default(403, 'Cannot change admin role');
    }
    if (target.role === newRole) {
        throw new AppError_1.default(400, `User is already a ${newRole}`);
    }
    target.role = newRole;
    yield target.save();
    return { message: `${target.name} is now a ${newRole}` };
});
const deleteUser = (targetId) => __awaiter(void 0, void 0, void 0, function* () {
    const target = yield user_model_1.User.findById(targetId);
    if (!target)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    if (target.role === 'admin')
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Cannot delete an admin');
    yield user_model_1.User.findByIdAndDelete(targetId);
    return { message: 'User deleted successfully' };
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        return { message: 'If this email exists, a reset link has been sent.' };
    }
    if (user.isBlocked) {
        throw new AppError_1.default(403, 'Your account is blocked!');
    }
    const token = yield (0, verifyEmailAndResetPassword_1.storeResetPasswordVerificationToken)(email);
    const resetLink = `http://localhost:3000/api/auth/reset-password?email=${email}&token=${token}`;
    yield (0, emailJob_1.addResetPasswordJob)(email, resetLink);
    return { message: 'If this email exists, a reset link has been sent.' };
});
const resetPassword = (email, token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const isValid = yield (0, verifyEmailAndResetPassword_1.verifyStoreResetPasswordVerificationTokenn)(email, token);
    if (!isValid) {
        throw new AppError_1.default(400, 'Invalid or expired reset link. Please request again.');
    }
    const user = yield user_model_1.User.findOne({ email });
    if (!user)
        throw new AppError_1.default(404, 'User not found');
    user.password = newPassword;
    user.sessions = [];
    yield user.save();
    return { message: 'Password reset successfully! Please login again.' };
});
const toggleWishlist = (userId, carId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(404, 'User not found');
    const car = yield car_model_1.Car.findById(carId);
    if (!car)
        throw new AppError_1.default(404, 'Car not found');
    if (car.status !== 'approved') {
        throw new AppError_1.default(400, 'Car is not available');
    }
    const isInWishlist = user.wishlist.map((id) => id.toString()).includes(carId);
    if (isInWishlist) {
        yield user_model_1.User.findByIdAndUpdate(userId, {
            $pull: { wishlist: carId },
        });
        return { message: 'Removed from wishlist', isWishlisted: false };
    }
    else {
        yield user_model_1.User.findByIdAndUpdate(userId, {
            $addToSet: { wishlist: carId },
        });
        return { message: 'Added to wishlist', isWishlisted: true };
    }
});
const getMyWishlist = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId)
        .populate({
        path: 'wishlist',
        match: { status: 'approved' },
        select: 'title brand model year price coverImage location condition',
    })
        .select('wishlist')
        .lean();
    if (!user)
        throw new AppError_1.default(404, 'User not found');
    return user.wishlist;
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('-password -sessions').lean();
    if (!user)
        throw new AppError_1.default(404, 'User not found');
    return user;
});
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
exports.userServices = {
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
