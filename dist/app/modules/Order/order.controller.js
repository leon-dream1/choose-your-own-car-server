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
exports.orderControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const order_services_1 = require("./order.services");
const createOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { carId } = req.body;
    const result = yield order_services_1.orderServices.createOrder(req.user._id, carId);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: 'Booking request sent to seller!',
        data: result,
    });
}));
const getMyOrders = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_services_1.orderServices.getMyOrders(req.user._id, req.user.role);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Orders retrieved',
        data: result,
    });
}));
const getSingleOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_services_1.orderServices.getSingleOrder(req.params.id, req.user._id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Single Order retrieved',
        data: result,
    });
}));
const cancelOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_services_1.orderServices.cancelOrder(req.params.id, req.user._id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: result.message,
        data: null,
    });
}));
const respondToOrder = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    const result = yield order_services_1.orderServices.respondToOrder(req.params.id, req.user._id, status);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: status === 'accepted'
            ? 'Order accepted! Buyer can now pay.'
            : 'Order rejected',
        data: result,
    });
}));
const initiatePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_services_1.orderServices.initiatePayment(req.params.id, req.user._id);
    res.status(200).json({
        success: true,
        message: 'Payment initiated',
        data: result,
    });
}));
const paymentSuccess = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId, orderId } = req.query;
    yield order_services_1.orderServices.paymentSuccess(transactionId, orderId);
    // Frontend-এ redirect করো
    res.redirect(`${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`);
}));
const verifyPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_services_1.orderServices.verifyPayment(req.params.transactionId, req.user._id);
    res
        .status(200)
        .json({ success: true, message: 'Payment verified', data: result });
}));
// Payment fail হলে
const paymentFail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.query;
    res.redirect(`${process.env.CLIENT_URL}/payment/fail?orderId=${orderId}`);
}));
const paymentCancel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.query;
    res.redirect(`${process.env.CLIENT_URL}/payment/cancel?orderId=${orderId}`);
}));
const getAllOrdersAdmin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield order_services_1.orderServices.getAllOrdersAdmin(req.query);
    res
        .status(200)
        .json({ success: true, message: 'All orders retrieved', data: result });
}));
exports.orderControllers = {
    createOrder,
    getMyOrders,
    getSingleOrder,
    cancelOrder,
    respondToOrder,
    initiatePayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    getAllOrdersAdmin,
    verifyPayment,
};
