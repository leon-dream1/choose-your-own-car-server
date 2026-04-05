"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const order_validation_1 = require("./order.validation");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
router.post('/payment/success', order_controller_1.orderControllers.paymentSuccess);
router.post('/payment/fail', order_controller_1.orderControllers.paymentFail);
router.post('/payment/cancel', order_controller_1.orderControllers.paymentCancel);
router.get('/admin/all', (0, auth_1.default)('admin'), order_controller_1.orderControllers.getAllOrdersAdmin);
router.get('/payment/verify/:transactionId', (0, auth_1.default)('user', 'seller'), order_controller_1.orderControllers.verifyPayment);
router.post('/', (0, auth_1.default)('user', 'seller'), (0, validateRequest_1.default)(order_validation_1.orderValidation.createOrderSchema), order_controller_1.orderControllers.createOrder);
router.get('/', (0, auth_1.default)('user', 'seller', 'admin'), order_controller_1.orderControllers.getMyOrders);
router.get('/:id', (0, auth_1.default)('user', 'seller', 'admin'), order_controller_1.orderControllers.getSingleOrder);
router.patch('/:id/cancel', (0, auth_1.default)('user', 'seller'), order_controller_1.orderControllers.cancelOrder);
router.patch('/:id/respond', (0, auth_1.default)('seller'), (0, validateRequest_1.default)(order_validation_1.orderValidation.respondOrderSchema), order_controller_1.orderControllers.respondToOrder);
//payment route
router.post('/:id/payment', (0, auth_1.default)('user', 'seller'), order_controller_1.orderControllers.initiatePayment);
exports.orderRoutes = router;
