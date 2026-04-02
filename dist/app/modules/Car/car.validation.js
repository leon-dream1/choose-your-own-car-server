"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createCarValidation = zod_1.default.object({
    body: zod_1.default.object({
        title: zod_1.default.string().min(3).max(100),
        brand: zod_1.default.string().min(1),
        model: zod_1.default.string().min(1),
        year: zod_1.default.coerce
            .number()
            .min(1990)
            .max(new Date().getFullYear() + 1),
        price: zod_1.default.coerce.number().min(0),
        mileage: zod_1.default.coerce.number().min(0),
        condition: zod_1.default.enum(['new', 'used']),
        description: zod_1.default.string().max(2000).optional(),
        location: zod_1.default.string().min(1),
    }),
});
const updateCarValidation = zod_1.default.object({
    body: zod_1.default.object({
        title: zod_1.default.string().min(3).max(100).optional(),
        brand: zod_1.default.string().min(1).optional(),
        model: zod_1.default.string().min(1).optional(),
        year: zod_1.default.coerce
            .number()
            .min(1990)
            .max(new Date().getFullYear() + 1)
            .optional(),
        price: zod_1.default.coerce.number().min(0).optional(),
        mileage: zod_1.default.coerce.number().min(0).optional(),
        condition: zod_1.default.enum(['new', 'used']).optional(),
        description: zod_1.default.string().max(2000).optional(),
        location: zod_1.default.string().min(1).optional(),
        keepImages: zod_1.default.string().optional(),
    }),
});
exports.carValidation = { createCarValidation, updateCarValidation };
