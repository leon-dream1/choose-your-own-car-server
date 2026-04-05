"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.get('/wishlist', (0, auth_1.default)('user', 'seller', 'admin'), user_controller_1.userControllers.getMyWishlist);
router.get('/me', (0, auth_1.default)('user', 'seller', 'admin'), user_controller_1.userControllers.getMe);
// router.patch('/me', auth('user', 'seller', 'admin'), userControllers.updateMe);
router.get('/users', (0, auth_1.default)('admin'), user_controller_1.userControllers.getAllUsers);
router.post('/register', rateLimiter_1.registerLimiter, (0, validateRequest_1.default)(user_validation_1.userValidationSchema.userRegisterValidationSchema), user_controller_1.userControllers.registerUser);
router.get('/verify', user_controller_1.userControllers.verifyEmail);
router.post('/forgot-password', rateLimiter_1.forgotPasswordLimiter, (0, validateRequest_1.default)(user_validation_1.userValidationSchema.forgotPasswordValidationSchema), user_controller_1.userControllers.forgotPassword);
router.post('/reset-password', (0, validateRequest_1.default)(user_validation_1.userValidationSchema.resetPasswordValidationSchema), user_controller_1.userControllers.resetPassword);
router.post('/login', rateLimiter_1.loginLimiter, (0, validateRequest_1.default)(user_validation_1.userValidationSchema.userLoginValidationSchema), user_controller_1.userControllers.loginUser);
router.post('/refresh-token', user_controller_1.userControllers.refreshToken);
router.post('/logout', (0, auth_1.default)('user', 'seller', 'admin'), user_controller_1.userControllers.logoutUser);
// wish list routes
router.post('/wishlist/:carId', (0, auth_1.default)('user', 'seller'), user_controller_1.userControllers.toggleWishlist);
// router.patch(
//   '/users/:id/block',
//   auth('admin', 'seller'),
//   userControllers.blockUser
// );
// block unblock by admin, seller cant block or unblock anyone, admin can block or unblock anyone except himself
router.patch('/users/:id/block', (0, auth_1.default)('admin'), user_controller_1.userControllers.toggleBlockUser);
router.patch('/users/:id/role', (0, auth_1.default)('admin'), (0, validateRequest_1.default)(user_validation_1.userValidationSchema.updateRoleValidationSchema), user_controller_1.userControllers.updateRole);
router.delete('/users/:id/delete', (0, auth_1.default)('admin'), user_controller_1.userControllers.deleteUser);
exports.userRoutes = router;
