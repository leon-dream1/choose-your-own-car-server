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
exports.orderServices = void 0;
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const car_model_1 = require("../Car/car.model");
const order_model_1 = require("./order.model");
const uuid_1 = require("uuid");
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const createOrder = (buyerId, carId) => __awaiter(void 0, void 0, void 0, function* () {
    const car = yield car_model_1.Car.findById(carId);
    if (!car)
        throw new AppError_1.default(404, 'Car not found');
    if (car.status !== 'approved') {
        throw new AppError_1.default(400, 'This car is not available');
    }
    if (car.seller.toString() === buyerId) {
        throw new AppError_1.default(400, 'You cannot book your own car');
    }
    const existingOrder = yield order_model_1.Order.findOne({
        car: carId,
        buyer: buyerId,
        status: { $in: ['pending', 'accepted'] },
    });
    if (existingOrder) {
        throw new AppError_1.default(400, 'You already have an active booking for this car');
    }
    const order = yield order_model_1.Order.create({
        car: carId,
        buyer: buyerId,
        seller: car.seller,
        price: car.price,
        status: 'pending',
    });
    return order.populate([
        { path: 'car', select: 'title coverImage price brand model' },
        { path: 'buyer', select: 'name email' },
        { path: 'seller', select: 'name email' },
    ]);
});
const getMyOrders = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = role === 'seller' ? { seller: userId } : { buyer: userId };
    const orders = yield order_model_1.Order.find(filter)
        .populate('car', 'title coverImage price brand model year')
        .populate('buyer', 'name email')
        .populate('seller', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    return orders;
});
const getSingleOrder = (orderId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.findById(orderId)
        .populate('car', 'title coverImage price brand model year location')
        .populate('buyer', 'name email')
        .populate('seller', 'name email');
    if (!order)
        throw new AppError_1.default(404, 'Order not found');
    const isParticipant = order.buyer._id.toString() === userId ||
        order.seller._id.toString() === userId;
    if (!isParticipant)
        throw new AppError_1.default(403, 'Not authorized');
    return order;
});
const cancelOrder = (orderId, buyerId) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.findById(orderId);
    if (!order)
        throw new AppError_1.default(404, 'Order not found');
    if (order.buyer.toString() !== buyerId) {
        throw new AppError_1.default(403, 'Only buyer can cancel');
    }
    if (order.status === 'paid') {
        throw new AppError_1.default(400, 'Cannot cancel a paid order');
    }
    if (order.status === 'rejected') {
        throw new AppError_1.default(400, 'Order is already rejected');
    }
    order.status = 'cancelled';
    yield order.save();
    return { message: 'Order cancelled' };
});
const respondToOrder = (orderId, sellerId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.findById(orderId);
    if (!order)
        throw new AppError_1.default(404, 'Order not found');
    if (order.seller.toString() !== sellerId) {
        throw new AppError_1.default(403, 'Only seller can respond');
    }
    if (order.status !== 'pending') {
        throw new AppError_1.default(400, `Order is already ${order.status}`);
    }
    order.status = status;
    yield order.save();
    return order.populate([
        { path: 'car', select: 'title coverImage price brand model' },
        { path: 'buyer', select: 'name email' },
        { path: 'seller', select: 'name email' },
    ]);
});
const initiatePayment = (orderId, buyerId) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.findById(orderId)
        .populate('car', 'title price')
        .populate('buyer', '_id name email');
    if (!order)
        throw new AppError_1.default(404, 'Order not found');
    if (order.buyer._id.toString() !== buyerId) {
        throw new AppError_1.default(403, 'Only buyer can pay');
    }
    if (order.status !== 'accepted') {
        throw new AppError_1.default(400, 'Seller must accept the order first');
    }
    // Unique transaction ID বানাও
    const transactionId = `TXN-${(0, uuid_1.v4)()}`;
    const sslData = {
        total_amount: order.price,
        currency: 'BDT',
        tran_id: transactionId,
        // Payment success/fail/cancel
        success_url: `${config_1.default.server_url}/api/orders/payment/success?transactionId=${transactionId}&orderId=${orderId}`,
        fail_url: `${config_1.default.server_url}/api/orders/payment/fail?orderId=${orderId}`,
        cancel_url: `${config_1.default.server_url}/api/orders/payment/cancel?orderId=${orderId}`,
        // Buyer info
        cus_name: order.buyer.name,
        cus_email: order.buyer.email,
        cus_add1: 'Bangladesh',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        // Product info
        product_name: order.car.title,
        product_category: 'Car',
        product_profile: 'general',
        shipping_method: 'NO',
        num_of_item: 1,
    };
    const isLive = config_1.default.SSLCOMMERZ_IS_LIVE === 'true';
    const sslcz = new sslcommerz_lts_1.default(config_1.default.SSLCOMMERZ_STORE_ID, config_1.default.SSLCOMMERZ_STORE_PASSWORD, isLive);
    const response = yield sslcz.init(sslData);
    if (!(response === null || response === void 0 ? void 0 : response.GatewayPageURL)) {
        throw new AppError_1.default(500, 'Payment initialization failed');
    }
    // order.transactionId = transactionId;
    // await order.save();
    return { paymentUrl: response.GatewayPageURL };
});
const paymentSuccess = (transactionId, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.findById(orderId);
    if (!order)
        throw new AppError_1.default(404, 'Order not found');
    if (order.status === 'paid') {
        return { message: 'Already paid' };
    }
    const session = yield order_model_1.Order.startSession();
    try {
        session.startTransaction();
        yield order_model_1.Order.findByIdAndUpdate(orderId, {
            status: 'paid',
            transactionId,
            paidAt: new Date(),
        }, { session });
        yield car_model_1.Car.findByIdAndUpdate(order.car, { status: 'sold' }, { session });
        yield session.commitTransaction();
        console.log(`✓ Payment success: ${transactionId}`);
    }
    catch (err) {
        yield session.abortTransaction();
        throw new AppError_1.default(500, 'Payment processing failed');
    }
    finally {
        session.endSession();
    }
    return { message: 'Payment successful' };
});
const verifyPayment = (transactionId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.findOne({ transactionId })
        .populate('car', 'title coverImage price')
        .populate('buyer', 'name email')
        .populate('seller', 'name email');
    if (!order)
        throw new AppError_1.default(404, 'Transaction not found');
    if (order.buyer._id.toString() !== userId) {
        throw new AppError_1.default(403, 'Not authorized');
    }
    return order;
});
const getAllOrdersAdmin = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = yield Promise.all([
        order_model_1.Order.find()
            .populate('car', 'title coverImage price')
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        order_model_1.Order.countDocuments(),
    ]);
    return {
        orders,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    };
});
exports.orderServices = {
    createOrder,
    getMyOrders,
    getSingleOrder,
    cancelOrder,
    respondToOrder,
    initiatePayment,
    paymentSuccess,
    getAllOrdersAdmin,
    verifyPayment,
};
