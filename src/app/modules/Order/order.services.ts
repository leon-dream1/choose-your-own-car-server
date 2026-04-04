/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { Car } from '../Car/car.model';
import { Order } from './order.model';
import { v4 as uuidv4 } from 'uuid';
import SSLCommerzPayment from 'sslcommerz-lts';
import { SSLCommerzInitData } from './order.constants';

const createOrder = async (buyerId: string, carId: string) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError(404, 'Car not found');
  if (car.status !== 'approved') {
    throw new AppError(400, 'This car is not available');
  }

  if (car.seller.toString() === buyerId) {
    throw new AppError(400, 'You cannot book your own car');
  }

  const existingOrder = await Order.findOne({
    car: carId,
    buyer: buyerId,
    status: { $in: ['pending', 'accepted'] },
  });

  if (existingOrder) {
    throw new AppError(400, 'You already have an active booking for this car');
  }

  const order = await Order.create({
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
};

const getMyOrders = async (userId: string, role: string) => {
  const filter = role === 'seller' ? { seller: userId } : { buyer: userId };

  const orders = await Order.find(filter)
    .populate('car', 'title coverImage price brand model year')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return orders;
};

const getSingleOrder = async (orderId: string, userId: string) => {
  const order = await Order.findById(orderId)
    .populate('car', 'title coverImage price brand model year location')
    .populate('buyer', 'name email')
    .populate('seller', 'name email');

  if (!order) throw new AppError(404, 'Order not found');

  const isParticipant =
    order.buyer._id.toString() === userId ||
    order.seller._id.toString() === userId;

  if (!isParticipant) throw new AppError(403, 'Not authorized');

  return order;
};

const cancelOrder = async (orderId: string, buyerId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(404, 'Order not found');

  if (order.buyer.toString() !== buyerId) {
    throw new AppError(403, 'Only buyer can cancel');
  }

  if (order.status === 'paid') {
    throw new AppError(400, 'Cannot cancel a paid order');
  }

  if (order.status === 'rejected') {
    throw new AppError(400, 'Order is already rejected');
  }

  order.status = 'cancelled';
  await order.save();

  return { message: 'Order cancelled' };
};

const respondToOrder = async (
  orderId: string,
  sellerId: string,
  status: 'accepted' | 'rejected'
) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(404, 'Order not found');

  if (order.seller.toString() !== sellerId) {
    throw new AppError(403, 'Only seller can respond');
  }

  if (order.status !== 'pending') {
    throw new AppError(400, `Order is already ${order.status}`);
  }

  order.status = status;
  await order.save();

  return order.populate([
    { path: 'car', select: 'title coverImage price brand model' },
    { path: 'buyer', select: 'name email' },
    { path: 'seller', select: 'name email' },
  ]);
};

const initiatePayment = async (orderId: string, buyerId: string) => {
  const order = await Order.findById(orderId)
    .populate<{ car: { title: string; price: number } }>('car', 'title price')
    .populate<{
      buyer: { _id: ObjectId; name: string; email: string };
    }>('buyer', '_id name email');

  if (!order) throw new AppError(404, 'Order not found');

  if (order.buyer._id.toString() !== buyerId) {
    throw new AppError(403, 'Only buyer can pay');
  }

  if (order.status !== 'accepted') {
    throw new AppError(400, 'Seller must accept the order first');
  }

  // Unique transaction ID বানাও
  const transactionId = `TXN-${uuidv4()}`;

  const sslData: SSLCommerzInitData = {
    total_amount: order.price,
    currency: 'BDT',
    tran_id: transactionId,

    // Payment success/fail/cancel
    success_url: `${config.server_url}/api/orders/payment/success?transactionId=${transactionId}&orderId=${orderId}`,
    fail_url: `${config.server_url}/api/orders/payment/fail?orderId=${orderId}`,
    cancel_url: `${config.server_url}/api/orders/payment/cancel?orderId=${orderId}`,

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

  const isLive = config.SSLCOMMERZ_IS_LIVE === 'true';

  const sslcz = new SSLCommerzPayment(
    config.SSLCOMMERZ_STORE_ID!,
    config.SSLCOMMERZ_STORE_PASSWORD!,
    isLive
  );

  const response = await sslcz.init(sslData);

  if (!response?.GatewayPageURL) {
    throw new AppError(500, 'Payment initialization failed');
  }

  // order.transactionId = transactionId;
  // await order.save();

  return { paymentUrl: response.GatewayPageURL };
};

const paymentSuccess = async (transactionId: string, orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError(404, 'Order not found');

  if (order.status === 'paid') {
    return { message: 'Already paid' };
  }

  const session = await Order.startSession();

  try {
    session.startTransaction();

    await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'paid',
        transactionId,
        paidAt: new Date(),
      },
      { session }
    );

    await Car.findByIdAndUpdate(order.car, { status: 'sold' }, { session });

    await session.commitTransaction();
    console.log(`✓ Payment success: ${transactionId}`);
  } catch (err: any) {
    await session.abortTransaction();
    throw new AppError(500, 'Payment processing failed');
  } finally {
    session.endSession();
  }

  return { message: 'Payment successful' };
};

const verifyPayment = async (transactionId: string, userId: string) => {
  const order = await Order.findOne({ transactionId })
    .populate('car', 'title coverImage price')
    .populate('buyer', 'name email')
    .populate('seller', 'name email');

  if (!order) throw new AppError(404, 'Transaction not found');

  if (order.buyer._id.toString() !== userId) {
    throw new AppError(403, 'Not authorized');
  }

  return order;
};

const getAllOrdersAdmin = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find()
      .populate('car', 'title coverImage price')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(),
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
};

export const orderServices = {
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
