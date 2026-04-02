"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const userRegisterValidationSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string().min(2).max(25).trim(),
        email: zod_1.default.email(),
        password: zod_1.default
            .string()
            .min(6)
            .max(20)
            .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain letters and numbers'),
    }),
    role: zod_1.default.enum(['user', 'admin']).optional(),
});
const userLoginValidationSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default.email(),
        password: zod_1.default
            .string()
            .min(6)
            .max(20)
            .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain letters and numbers'),
    }),
});
const forgotPasswordValidationSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default.email('Invalid email'),
    }),
});
const resetPasswordValidationSchema = zod_1.default.object({
    body: zod_1.default.object({
        newPassword: zod_1.default
            .string()
            .min(6)
            .max(20)
            .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain letters and numbers'),
    }),
});
const updateRoleValidationSchema = zod_1.default.object({
    body: zod_1.default.object({
        role: zod_1.default.enum(['user', 'seller']),
    }),
});
exports.userValidationSchema = {
    userRegisterValidationSchema,
    userLoginValidationSchema,
    forgotPasswordValidationSchema,
    resetPasswordValidationSchema,
    updateRoleValidationSchema,
};
