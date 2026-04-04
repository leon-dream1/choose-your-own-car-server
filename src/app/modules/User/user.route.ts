import { Router } from 'express';
import { userControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidationSchema } from './user.validation';
import auth from '../../middlewares/auth';
import {
  forgotPasswordLimiter,
  loginLimiter,
  registerLimiter,
} from '../../middlewares/rateLimiter';

const router = Router();

router.get(
  '/wishlist',
  auth('user', 'seller', 'admin'),
  userControllers.getMyWishlist
);
router.get('/me', auth('user', 'seller', 'admin'), userControllers.getMe);
// router.patch('/me', auth('user', 'seller', 'admin'), userControllers.updateMe);
router.get('/users', auth('admin'), userControllers.getAllUsers);

router.post(
  '/register',
  registerLimiter,
  validateRequest(userValidationSchema.userRegisterValidationSchema),
  userControllers.registerUser
);
router.get('/verify', userControllers.verifyEmail);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateRequest(userValidationSchema.forgotPasswordValidationSchema),
  userControllers.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(userValidationSchema.resetPasswordValidationSchema),
  userControllers.resetPassword
);

router.post(
  '/login',
  loginLimiter,
  validateRequest(userValidationSchema.userLoginValidationSchema),
  userControllers.loginUser
);

router.post('/refresh-token', userControllers.refreshToken);

router.post(
  '/logout',
  auth('user', 'seller', 'admin'),
  userControllers.logoutUser
);
// wish list routes
router.post(
  '/wishlist/:carId',
  auth('user', 'seller'),
  userControllers.toggleWishlist
);

// router.patch(
//   '/users/:id/block',
//   auth('admin', 'seller'),
//   userControllers.blockUser
// );

// block unblock by admin, seller cant block or unblock anyone, admin can block or unblock anyone except himself
router.patch(
  '/users/:id/block',
  auth('admin'),
  userControllers.toggleBlockUser
);
router.patch(
  '/users/:id/role',
  auth('admin'),
  validateRequest(userValidationSchema.updateRoleValidationSchema),
  userControllers.updateRole
);
router.delete('/users/:id/delete', auth('admin'), userControllers.deleteUser);

export const userRoutes = router;
