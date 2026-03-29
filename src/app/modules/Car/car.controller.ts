import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status';
import { carServices } from './car.service';

const createCar = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user!._id;
  const files = req.files as Express.Multer.File[];

  const result = await carServices.createCar(sellerId, req.body, files);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Car listed successfully! Waiting for admin approval.',
    data: result,
  });
});

const updateCarStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await carServices.updateCarStatus(id, status);

  res.status(httpStatus.OK).json({
    success: true,
    message: `Car ${status} successfully`,
    data: result,
  });
});

const deleteCar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await carServices.deleteCar(id, req.user!._id, req.user!.role);

  res.status(httpStatus.OK).json({
    success: true,
    message: result.message,
    data: null,
  });
});

const getMyCars = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user!._id;
  const result = await carServices.getMyCars(sellerId);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Your listings retrieved',
    data: result,
  });
});

export const carControllers = {
  createCar,
  updateCarStatus,
  deleteCar,
  getMyCars,
};
