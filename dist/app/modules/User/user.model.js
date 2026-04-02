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
exports.User = exports.userSchema = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const user_constant_1 = require("./user.constant");
exports.userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        minlength: 2,
        maxlength: 25,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'seller', 'admin'],
            message: '{VALUE} is not a valid role',
        },
        default: 'user',
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isVerified: { type: Boolean, default: false },
    sessions: [user_constant_1.sessionSchema],
}, {
    timestamps: true,
});
exports.userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (this.isModified('password') && this.password) {
                this.password = yield bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
            }
            next();
        }
        catch (err) {
            next(err); // pass error to Mongoose error handler
        }
    });
});
exports.User = (0, mongoose_1.model)('User', exports.userSchema);
