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
exports.userControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const user_service_1 = require("./user.service");
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const registerUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    const result = yield user_service_1.userServices.saveUserToDB(userData);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: result === null || result === void 0 ? void 0 : result.message,
        data: null,
    });
}));
const verifyEmail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token } = req.query;
    if (!email || !token) {
        throw new AppError_1.default(400, 'Email and token are required');
    }
    const result = yield user_service_1.userServices.verifyEmail(email, token);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: result.message,
        data: null,
    });
}));
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const deviceInfo = req.headers['user-agent'] || 'unknown'; // browser/device info
    const { accessToken, refreshToken } = yield user_service_1.userServices.loginUserToDB(email, password, deviceInfo);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config_1.default.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Login successful',
        data: { accessToken },
    });
}));
const refreshToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!token)
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'No refresh token found');
    const accessToken = yield user_service_1.userServices.refreshAccessToken(token);
    res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: { accessToken },
    });
}));
const logoutUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!refreshToken)
        throw new AppError_1.default(400, 'No active session found');
    yield user_service_1.userServices.logoutUser(refreshToken);
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Logged out successfully',
        data: null,
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userServices.getAllUsers();
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
}));
const blockUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const targetId = req.params.id;
    const requesterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const result = yield user_service_1.userServices.blockUser(targetId, requesterId);
    res.status(200).json({
        success: true,
        message: result.message,
        data: null,
    });
}));
const updateRole = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const targetId = req.params.id;
    const requesterId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { role } = req.body;
    const result = yield user_service_1.userServices.updateRole(targetId, requesterId, role);
    res.status(200).json({
        success: true,
        message: result.message,
        data: null,
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userServices.deleteUser(req.params.id);
    res.status(200).json({
        success: true,
        message: result.message,
        data: null,
    });
}));
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const result = yield user_service_1.userServices.forgotPassword(email);
    res.status(200).json({
        success: true,
        message: result.message,
        data: null,
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, token } = req.query;
    const { newPassword } = req.body;
    if (!email || !token) {
        throw new AppError_1.default(400, 'Email and token are required');
    }
    const result = yield user_service_1.userServices.resetPassword(email, token, newPassword);
    res.status(200).json({
        success: true,
        message: result.message,
        data: null,
    });
}));
exports.userControllers = {
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
};
