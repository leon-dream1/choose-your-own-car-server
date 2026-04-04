import AppError from '../../errors/AppError';
import {
  buildCacheKey,
  CACHE_TTL,
  deleteCacheByPattern,
  getCache,
  setCache,
} from '../../redis/cache';
import {
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  uploadMultipleToCloudinary,
} from '../../utils/uploadImageToCloudinary';
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
    coverImage: imageUrls[0],
    images: imageUrls,
    status: 'pending',
  });

  await deleteCacheByPattern('cars:*');

  return car;
};

const getAllApprovedCars = async (query: Record<string, unknown>) => {
  const cacheKey = buildCacheKey('cars', query);
  const cached = await getCache<{
    result: TCar[];
    pagination: object;
  }>(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return cached;
  }

  console.log(' Cache miss:', cacheKey);

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

  const result = {
    cars,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };

  setCache(cacheKey, result, CACHE_TTL.CAR_LIST);

  return result;
};

const getSingleCar = async (carId: string) => {
  const cacheKey = `car:detail:${carId}`;

  const cached = await getCache<TCar>(cacheKey);
  if (cached) {
    console.log('✓ Cache hit:', cacheKey);
    return cached;
  }
  const car = await Car.findOne({ _id: carId, status: 'approved' })
    .populate('seller', 'name email')
    .lean();

  if (!car) throw new AppError(404, 'Car not found');

  await setCache(cacheKey, car, CACHE_TTL.CAR_DETAIL);

  return car;
};

const updateCarStatus = async (
  carId: string,
  status: 'approved' | 'rejected'
) => {
  const car = await Car.findByIdAndUpdate(carId, { status }, { new: true });
  if (!car) throw new AppError(404, 'Car not found');

  await deleteCacheByPattern('cars:*');
  await deleteCacheByPattern(`car:detail:${carId}`);
  return car;
};

const deleteCar = async (carId: string, userId: string, role: string) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError(404, 'Car not found');

  if (role !== 'admin' && car.seller.toString() !== userId) {
    throw new AppError(403, 'You can only delete your own listings');
  }

  if (car.images && car.images.length > 0) {
    await Promise.all(
      car.images.map((imageUrl) => deleteFromCloudinary(imageUrl))
    );
  }

  await Car.findByIdAndDelete(carId);

  await deleteCacheByPattern('cars:*');
  await deleteCacheByPattern(`car:detail:${carId}`);

  return { message: 'Car and images deleted successfully' };
};

const getMyCars = async (sellerId: string) => {
  const cars = await Car.find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .lean();
  return cars;
};

const updateCar = async (
  carId: string,
  sellerId: string,
  updateData: Partial<TCar>,
  newFiles: Express.Multer.File[],
  keepImages: string[]
) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError(404, 'Car not found');

  if (car.seller.toString() !== sellerId) {
    throw new AppError(403, 'You can only edit your own listings');
  }

  const imagesToDelete = car.images.filter((img) => !keepImages.includes(img));

  if (imagesToDelete.length > 0) {
    await deleteMultipleFromCloudinary(imagesToDelete);
    console.log(`✓ Deleted ${imagesToDelete.length} old images`);
  }

  let newImageUrls: string[] = [];
  if (newFiles && newFiles.length > 0) {
    newImageUrls = await uploadMultipleToCloudinary(
      newFiles,
      `cars/${sellerId}`
    );
    console.log(`✓ Uploaded ${newImageUrls.length} new images`);
  }

  const finalImages = [...keepImages, ...newImageUrls];

  if (finalImages.length === 0) {
    throw new AppError(400, 'Car must have at least 1 image');
  }

  if (finalImages.length > 5) {
    throw new AppError(400, 'Maximum 5 images allowed');
  }

  const updatedCar = await Car.findByIdAndUpdate(
    carId,
    {
      ...updateData,
      images: finalImages,
      coverImage: finalImages[0],
      status: 'pending',
    },
    { new: true, runValidators: true }
  );

  await deleteCacheByPattern('cars:*');
  await deleteCacheByPattern(`car:detail:${carId}`);

  return updatedCar;
};

const toggleFeatured = async (carId: string) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError(404, 'Car not found');
  if (car.status !== 'approved') {
    throw new AppError(400, 'Only approved cars can be featured');
  }

  car.isFeatured = !car.isFeatured;
  await car.save();

  // Cache invalidate করো
  await deleteCacheByPattern('cars:*');
  await deleteCacheByPattern(`car:detail:${carId}`);

  return {
    message: car.isFeatured
      ? 'Car marked as featured'
      : 'Car removed from featured',
    isFeatured: car.isFeatured,
  };
};

const getFeaturedCars = async () => {
  const cacheKey = 'cars:featured';
  const cached = await getCache<TCar[]>(cacheKey);
  if (cached) return cached;

  const cars = await Car.find({ status: 'approved', isFeatured: true })
    .populate('seller', 'name email')
    .select(
      'title brand model year price coverImage location condition isFeatured'
    )
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  await setCache(cacheKey, cars, CACHE_TTL.CAR_LIST);
  return cars;
};

const getPendingCars = async (query: Record<string, unknown>) => {
  const { page = 1, limit = 10 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const [cars, total] = await Promise.all([
    Car.find({ status: 'pending' })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Car.countDocuments({ status: 'pending' }),
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

export const carServices = {
  createCar,
  getAllApprovedCars,
  getSingleCar,
  updateCarStatus,
  deleteCar,
  getMyCars,
  updateCar,
  toggleFeatured,
  getFeaturedCars,
  getPendingCars,
};
