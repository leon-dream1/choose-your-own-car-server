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
exports.buildCacheKey = exports.deleteCacheByPattern = exports.deleteCache = exports.getCache = exports.setCache = exports.CACHE_TTL = void 0;
const redis_config_1 = __importDefault(require("../config/redis.config"));
exports.CACHE_TTL = {
    CAR_LIST: 60 * 5,
    CAR_DETAIL: 60 * 10,
};
const setCache = (key, data, ttl) => __awaiter(void 0, void 0, void 0, function* () {
    yield redis_config_1.default.set(key, JSON.stringify(data), { ex: ttl });
});
exports.setCache = setCache;
const getCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield redis_config_1.default.get(key);
    if (!data)
        return null;
    if (typeof data === 'string') {
        return JSON.parse(data);
    }
    return data;
});
exports.getCache = getCache;
const deleteCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    yield redis_config_1.default.del(key);
});
exports.deleteCache = deleteCache;
const deleteCacheByPattern = (pattern) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = yield redis_config_1.default.keys(pattern);
    if (keys.length > 0) {
        yield Promise.all(keys.map((key) => redis_config_1.default.del(key)));
    }
});
exports.deleteCacheByPattern = deleteCacheByPattern;
const buildCacheKey = (prefix, query) => {
    const sortedQuery = Object.keys(query)
        .sort()
        .map((key) => `${key}=${query[key]}`)
        .join('&');
    return `${prefix}:${sortedQuery}`;
};
exports.buildCacheKey = buildCacheKey;
