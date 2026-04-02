"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    database_url: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    port: process.env.PORT,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_expires_in: process.env
        .JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_expires_in: process.env
        .JWT_REFRESH_EXPIRES_IN,
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASS,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_HOST: process.env.UPSTASH_REDIS_HOST,
    UPSTASH_REDIS_PORT: process.env.UPSTASH_REDIS_PORT,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    client_url: process.env.CLIENT_URL,
};
