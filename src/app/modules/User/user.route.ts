import { Router } from 'express';
import { userControllers } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidationSchema } from './user.validation';
import auth from '../../middlewares/auth';
import { loginLimiter, registerLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.post(
  '/register',
  registerLimiter,
  validateRequest(userValidationSchema.userRegisterValidationSchema),
  userControllers.registerUser
);

router.get('/verify', userControllers.verifyEmail);

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

router.get('/all-users', auth('admin'), userControllers.getAllUsers);

router.patch('/block/:id', auth('admin', 'seller'), userControllers.blockUser);

router.delete('/delete/:id', auth('admin'), userControllers.deleteUser);

export const userRoutes = router;
