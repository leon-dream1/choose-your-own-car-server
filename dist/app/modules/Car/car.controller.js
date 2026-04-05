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
exports.carControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const car_service_1 = require("./car.service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createCar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sellerId = req.user._id;
    const files = req.files;
    const result = yield car_service_1.carServices.createCar(sellerId, req.body, files);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: 'Car listed successfully! Waiting for admin approval.',
        data: result,
    });
}));
const getAllApprovedCars = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield car_service_1.carServices.getAllApprovedCars(req.query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Cars retrieved successfully',
        data: result,
    });
}));
const getSingleCar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield car_service_1.carServices.getSingleCar(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Car retrieved successfully',
        data: result,
    });
}));
const updateCarStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    const result = yield car_service_1.carServices.updateCarStatus(id, status);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: `Car ${status} successfully`,
        data: result,
    });
}));
const deleteCar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield car_service_1.carServices.deleteCar(id, req.user._id, req.user.role);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: result.message,
        data: null,
    });
}));
const getMyCars = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sellerId = req.user._id;
    const result = yield car_service_1.carServices.getMyCars(sellerId);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Your listings retrieved',
        data: result,
    });
}));
const updateCar = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const sellerId = req.user._id;
    const newFiles = req.files || [];
    let keepImages = [];
    if (req.body.keepImages) {
        try {
            keepImages = JSON.parse(req.body.keepImages);
        }
        catch (_a) {
            throw new AppError_1.default(400, 'keepImages must be a valid JSON array');
        }
    }
    const result = yield car_service_1.carServices.updateCar(id, sellerId, req.body, newFiles, keepImages);
    res.status(200).json({
        success: true,
        message: 'Car updated successfully! Waiting for re-approval.',
        data: result,
    });
}));
const toggleFeatured = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield car_service_1.carServices.toggleFeatured(req.params.id);
    res.status(200).json({
        success: true,
        message: result.message,
        data: { isFeatured: result.isFeatured },
    });
}));
const getFeaturedCars = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield car_service_1.carServices.getFeaturedCars();
    res
        .status(200)
        .json({ success: true, message: 'Featured cars retrieved', data: result });
}));
const getPendingCars = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield car_service_1.carServices.getPendingCars(req.query);
    res
        .status(200)
        .json({ success: true, message: 'Pending cars retrieved', data: result });
}));
exports.carControllers = {
    createCar,
    getAllApprovedCars,
    updateCarStatus,
    deleteCar,
    getMyCars,
    getSingleCar,
    updateCar,
    toggleFeatured,
    getFeaturedCars,
    getPendingCars,
};
