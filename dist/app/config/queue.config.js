"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const _1 = __importDefault(require("."));
exports.redisConnection = {
    host: _1.default.UPSTASH_REDIS_HOST,
    port: Number(_1.default.UPSTASH_REDIS_PORT),
    password: _1.default.UPSTASH_REDIS_REST_TOKEN,
    tls: {},
};
