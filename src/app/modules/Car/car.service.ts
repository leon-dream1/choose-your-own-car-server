import AppError from '../../errors/AppError';
import { uploadMultipleToCloudinary } from '../../utils/uploadImageToCloudinary';
import { TCar } from './car.interface';
import { Car } from './car.model';

const createCar = async (
  sellerId: string,
  carData: Partial<TCar>,
  files: Express.Multer.File[]
) => {
  let imageUrls: string[] = [];

  if (files && files.length > 0) {
    imageUrls = await uploadMultipleToCloudinary(files, `cars/${sellerId}`);
  }

  const car = await Car.create({
    ...carData,
    seller: sellerId,
    images: imageUrls,
    status: 'pending',
  });

  return car;
};

const updateCarStatus = async (
  carId: string,
  status: 'approved' | 'rejected'
) => {
  const car = await Car.findByIdAndUpdate(carId, { status }, { new: true });
  if (!car) throw new AppError(404, 'Car not found');
  return car;
};

const deleteCar = async (carId: string, userId: string, role: string) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError(404, 'Car not found');

  if (role !== 'admin' && car.seller.toString() !== userId) {
    throw new AppError(403, 'You can only delete your own listings');
  }

  await Car.findByIdAndDelete(carId);
  return { message: 'Car listing deleted' };
};

const getMyCars = async (sellerId: string) => {
  const cars = await Car.find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .lean();
  return cars;
};

export const carServices = {
  createCar,
  updateCarStatus,
  deleteCar,
  getMyCars,
};
