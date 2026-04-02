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
exports.forgotPasswordLimiter = exports.loginLimiter = exports.registerLimiter = exports.forgetPasswordRateLimit = exports.loginRateLimit = exports.registerRateLimit = void 0;
const ratelimit_1 = require("@upstash/ratelimit");
const redis_config_1 = __importDefault(require("../config/redis.config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
exports.registerRateLimit = new ratelimit_1.Ratelimit({
    redis: redis_config_1.default,
    limiter: ratelimit_1.Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:register',
});
exports.loginRateLimit = new ratelimit_1.Ratelimit({
    redis: redis_config_1.default,
    limiter: ratelimit_1.Ratelimit.slidingWindow(10, '15 m'),
    prefix: 'ratelimit:login',
});
exports.forgetPasswordRateLimit = new ratelimit_1.Ratelimit({
    redis: redis_config_1.default,
    limiter: ratelimit_1.Ratelimit.slidingWindow(3, '15 m'),
    prefix: 'ratelimit:forget-password',
});
const registerLimiter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        console.log('ip', ip);
        const { success, limit, remaining, reset } = yield exports.registerRateLimit.limit(ip);
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', reset);
        if (!success) {
            throw new AppError_1.default(429, 'Too many requests! Please wait 1 minute and try again.');
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.registerLimiter = registerLimiter;
const loginLimiter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const { success, limit, remaining, reset } = yield exports.loginRateLimit.limit(ip);
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', reset);
        if (!success) {
            throw new AppError_1.default(429, 'Too many login attempts! Please wait 15 minutes.');
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.loginLimiter = loginLimiter;
const forgotPasswordLimiter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const { success, limit, remaining, reset } = yield exports.forgetPasswordRateLimit.limit(ip);
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', reset);
        if (!success) {
            throw new AppError_1.default(429, 'Too many login attempts! Please wait 15 minutes.');
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.forgotPasswordLimiter = forgotPasswordLimiter;
