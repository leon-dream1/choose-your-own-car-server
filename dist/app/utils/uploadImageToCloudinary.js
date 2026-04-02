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
exports.deleteMultipleFromCloudinary = exports.deleteFromCloudinary = exports.uploadMultipleToCloudinary = exports.uploadImageToCloudinary = void 0;
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const uploadImageToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_config_1.default.uploader.upload_stream({
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1200, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' },
            ],
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        uploadStream.end(fileBuffer);
    });
};
exports.uploadImageToCloudinary = uploadImageToCloudinary;
const uploadMultipleToCloudinary = (files, folder) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadPromises = files.map((file) => (0, exports.uploadImageToCloudinary)(file.buffer, folder));
    const results = yield Promise.all(uploadPromises);
    return results.map((result) => result.secure_url);
});
exports.uploadMultipleToCloudinary = uploadMultipleToCloudinary;
const deleteFromCloudinary = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const publicId = imageUrl.split('/').slice(-3).join('/').split('.')[0];
    yield cloudinary_config_1.default.uploader.destroy(publicId);
});
exports.deleteFromCloudinary = deleteFromCloudinary;
const deleteMultipleFromCloudinary = (imageUrls) => __awaiter(void 0, void 0, void 0, function* () {
    if (!imageUrls || imageUrls.length === 0)
        return;
    yield Promise.all(imageUrls.map((url) => (0, exports.deleteFromCloudinary)(url)));
});
exports.deleteMultipleFromCloudinary = deleteMultipleFromCloudinary;
