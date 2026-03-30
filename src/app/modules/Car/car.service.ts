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

const getAllApprovedCars = async (query: Record<string, unknown>) => {
  const {
    brand,
    condition,
    minPrice,
    maxPrice,
    search,
    page = 1,
    limit = 10,
  } = query;

  const filter: Record<string, unknown> = { status: 'approved' };

  // Dynamic filters
  if (brand) filter.brand = brand;
  if (condition) filter.condition = condition;

  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {};

    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);

    filter.price = priceFilter;
  }

  // Text search — title বা description-এ খোঁজো
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } }, // case insensitive
      { brand: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [cars, total] = await Promise.all([
    Car.find(filter)
      .populate('seller', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Car.countDocuments(filter),
  ]);

  return {
    cars,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
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
  getAllApprovedCars,
  updateCarStatus,
  deleteCar,
  getMyCars,
};
