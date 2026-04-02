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
exports.carServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const cache_1 = require("../../redis/cache");
const uploadImageToCloudinary_1 = require("../../utils/uploadImageToCloudinary");
const car_model_1 = require("./car.model");
const createCar = (sellerId, carData, files) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrls = [];
    if (files && files.length > 0) {
        imageUrls = yield (0, uploadImageToCloudinary_1.uploadMultipleToCloudinary)(files, `cars/${sellerId}`);
    }
    const car = yield car_model_1.Car.create(Object.assign(Object.assign({}, carData), { seller: sellerId, coverImage: imageUrls[0], images: imageUrls, status: 'pending' }));
    yield (0, cache_1.deleteCacheByPattern)('cars:*');
    return car;
});
const getAllApprovedCars = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = (0, cache_1.buildCacheKey)('cars', query);
    const cached = yield (0, cache_1.getCache)(cacheKey);
    if (cached) {
        console.log('Cache hit:', cacheKey);
        return cached;
    }
    console.log(' Cache miss:', cacheKey);
    const { brand, condition, minPrice, maxPrice, search, page = 1, limit = 10, } = query;
    const filter = { status: 'approved' };
    // Dynamic filters
    if (brand)
        filter.brand = brand;
    if (condition)
        filter.condition = condition;
    if (minPrice || maxPrice) {
        const priceFilter = {};
        if (minPrice)
            priceFilter.$gte = Number(minPrice);
        if (maxPrice)
            priceFilter.$lte = Number(maxPrice);
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
    const [cars, total] = yield Promise.all([
        car_model_1.Car.find(filter)
            .populate('seller', 'name email')
            .select('-__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        car_model_1.Car.countDocuments(filter),
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
    (0, cache_1.setCache)(cacheKey, result, cache_1.CACHE_TTL.CAR_LIST);
    return result;
});
const getSingleCar = (carId) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `car:detail:${carId}`;
    const cached = yield (0, cache_1.getCache)(cacheKey);
    if (cached) {
        console.log('✓ Cache hit:', cacheKey);
        return cached;
    }
    const car = yield car_model_1.Car.findOne({ _id: carId, status: 'approved' })
        .populate('seller', 'name email')
        .lean();
    if (!car)
        throw new AppError_1.default(404, 'Car not found');
    yield (0, cache_1.setCache)(cacheKey, car, cache_1.CACHE_TTL.CAR_DETAIL);
    return car;
});
const updateCarStatus = (carId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const car = yield car_model_1.Car.findByIdAndUpdate(carId, { status }, { new: true });
    if (!car)
        throw new AppError_1.default(404, 'Car not found');
    yield (0, cache_1.deleteCacheByPattern)('cars:*');
    yield (0, cache_1.deleteCacheByPattern)(`car:detail:${carId}`);
    return car;
});
const deleteCar = (carId, userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const car = yield car_model_1.Car.findById(carId);
    if (!car)
        throw new AppError_1.default(404, 'Car not found');
    if (role !== 'admin' && car.seller.toString() !== userId) {
        throw new AppError_1.default(403, 'You can only delete your own listings');
    }
    if (car.images && car.images.length > 0) {
        yield Promise.all(car.images.map((imageUrl) => (0, uploadImageToCloudinary_1.deleteFromCloudinary)(imageUrl)));
    }
    yield car_model_1.Car.findByIdAndDelete(carId);
    yield (0, cache_1.deleteCacheByPattern)('cars:*');
    yield (0, cache_1.deleteCacheByPattern)(`car:detail:${carId}`);
    return { message: 'Car and images deleted successfully' };
});
const getMyCars = (sellerId) => __awaiter(void 0, void 0, void 0, function* () {
    const cars = yield car_model_1.Car.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .lean();
    return cars;
});
const updateCar = (carId, sellerId, updateData, newFiles, keepImages) => __awaiter(void 0, void 0, void 0, function* () {
    const car = yield car_model_1.Car.findById(carId);
    if (!car)
        throw new AppError_1.default(404, 'Car not found');
    if (car.seller.toString() !== sellerId) {
        throw new AppError_1.default(403, 'You can only edit your own listings');
    }
    const imagesToDelete = car.images.filter((img) => !keepImages.includes(img));
    if (imagesToDelete.length > 0) {
        yield (0, uploadImageToCloudinary_1.deleteMultipleFromCloudinary)(imagesToDelete);
        console.log(`✓ Deleted ${imagesToDelete.length} old images`);
    }
    let newImageUrls = [];
    if (newFiles && newFiles.length > 0) {
        newImageUrls = yield (0, uploadImageToCloudinary_1.uploadMultipleToCloudinary)(newFiles, `cars/${sellerId}`);
        console.log(`✓ Uploaded ${newImageUrls.length} new images`);
    }
    const finalImages = [...keepImages, ...newImageUrls];
    if (finalImages.length === 0) {
        throw new AppError_1.default(400, 'Car must have at least 1 image');
    }
    if (finalImages.length > 5) {
        throw new AppError_1.default(400, 'Maximum 5 images allowed');
    }
    const updatedCar = yield car_model_1.Car.findByIdAndUpdate(carId, Object.assign(Object.assign({}, updateData), { images: finalImages, coverImage: finalImages[0], status: 'pending' }), { new: true, runValidators: true });
    yield (0, cache_1.deleteCacheByPattern)('cars:*');
    yield (0, cache_1.deleteCacheByPattern)(`car:detail:${carId}`);
    return updatedCar;
});
exports.carServices = {
    createCar,
    getAllApprovedCars,
    getSingleCar,
    updateCarStatus,
    deleteCar,
    getMyCars,
    updateCar,
};
