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
exports.verifyStoreResetPasswordVerificationTokenn = exports.storeResetPasswordVerificationToken = exports.verifyStoredEmailVerificationToken = exports.storeEmailVerificationToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_config_1 = __importDefault(require("../config/redis.config"));
const VERIFY_EMAIL_TOKEN_EXPIRY_SECONDS = 60 * 10;
const RESET_PASSWORD_TOKEN_EXPIRY_SECONDS = 60 * 15;
const storeEmailVerificationToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    yield redis_config_1.default.set(`verify:${email}`, token, {
        ex: VERIFY_EMAIL_TOKEN_EXPIRY_SECONDS,
    });
    return token;
});
exports.storeEmailVerificationToken = storeEmailVerificationToken;
const verifyStoredEmailVerificationToken = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const storedToken = yield redis_config_1.default.get(`verify:${email}`);
    if (!storedToken)
        return false;
    if (storedToken !== token)
        return false;
    yield redis_config_1.default.del(`verify:${email}`);
    return true;
});
exports.verifyStoredEmailVerificationToken = verifyStoredEmailVerificationToken;
const storeResetPasswordVerificationToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    yield redis_config_1.default.set(`reset:${email}`, token, {
        ex: RESET_PASSWORD_TOKEN_EXPIRY_SECONDS,
    });
    return token;
});
exports.storeResetPasswordVerificationToken = storeResetPasswordVerificationToken;
const verifyStoreResetPasswordVerificationTokenn = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    const storedToken = yield redis_config_1.default.get(`reset:${email}`);
    if (!storedToken)
        return false;
    if (storedToken !== token)
        return false;
    yield redis_config_1.default.del(`reset:${email}`);
    return true;
});
exports.verifyStoreResetPasswordVerificationTokenn = verifyStoreResetPasswordVerificationTokenn;
