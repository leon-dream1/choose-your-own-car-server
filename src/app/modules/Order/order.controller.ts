import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status';
import { orderServices } from './order.services';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { carId } = req.body;
  const result = await orderServices.createOrder(req.user!._id, carId);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Booking request sent to seller!',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.getMyOrders(req.user!._id, req.user!.role);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Orders retrieved',
    data: result,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.getSingleOrder(
    req.params.id,
    req.user!._id
  );
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Single Order retrieved',
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.cancelOrder(req.params.id, req.user!._id);
  res.status(httpStatus.OK).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const respondToOrder = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await orderServices.respondToOrder(
    req.params.id,
    req.user!._id,
    status
  );
  res.status(httpStatus.OK).json({
    success: true,
    message:
      status === 'accepted'
        ? 'Order accepted! Buyer can now pay.'
        : 'Order rejected',
    data: result,
  });
});

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.initiatePayment(
    req.params.id,
    req.user!._id
  );

  res.status(200).json({
    success: true,
    message: 'Payment initiated',
    data: result,
  });
});

const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const { transactionId, orderId } = req.query as {
    transactionId: string;
    orderId: string;
  };

  await orderServices.paymentSuccess(transactionId, orderId);

  // Frontend-এ redirect করো
  res.redirect(`${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`);
});

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.verifyPayment(
    req.params.transactionId,
    req.user!._id
  );
  res
    .status(200)
    .json({ success: true, message: 'Payment verified', data: result });
});

// Payment fail হলে
const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.query as { orderId: string };
  res.redirect(`${process.env.CLIENT_URL}/payment/fail?orderId=${orderId}`);
});

const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.query as { orderId: string };
  res.redirect(`${process.env.CLIENT_URL}/payment/cancel?orderId=${orderId}`);
});

const getAllOrdersAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await orderServices.getAllOrdersAdmin(req.query);
  res
    .status(200)
    .json({ success: true, message: 'All orders retrieved', data: result });
});

export const orderControllers = {
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
