"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createOrderSchema = zod_1.default.object({
    body: zod_1.default.object({
        carId: zod_1.default.string().min(1, 'Car ID required'),
    }),
});
const respondOrderSchema = zod_1.default.object({
    body: zod_1.default.object({
        status: zod_1.default.enum(['accepted', 'rejected']),
    }),
});
exports.orderValidation = {
    createOrderSchema,
    respondOrderSchema,
};
