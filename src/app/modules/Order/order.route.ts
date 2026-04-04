import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { orderValidation } from './order.validation';
import { orderControllers } from './order.controller';

const router = Router();

router.post('/payment/success', orderControllers.paymentSuccess);
router.post('/payment/fail', orderControllers.paymentFail);
router.post('/payment/cancel', orderControllers.paymentCancel);

router.get('/admin/all', auth('admin'), orderControllers.getAllOrdersAdmin);

router.get(
  '/payment/verify/:transactionId',
  auth('user', 'seller'),
  orderControllers.verifyPayment
);

router.post(
  '/',
  auth('user', 'seller'),
  validateRequest(orderValidation.createOrderSchema),
  orderControllers.createOrder
);

router.get('/', auth('user', 'seller', 'admin'), orderControllers.getMyOrders);
router.get(
  '/:id',
  auth('user', 'seller', 'admin'),
  orderControllers.getSingleOrder
);

router.patch(
  '/:id/cancel',
  auth('user', 'seller'),
  orderControllers.cancelOrder
);

router.patch(
  '/:id/respond',
  auth('seller'),
  validateRequest(orderValidation.respondOrderSchema),
  orderControllers.respondToOrder
);

//payment route
router.post(
  '/:id/payment',
  auth('user', 'seller'),
  orderControllers.initiatePayment
);

export const orderRoutes = router;
