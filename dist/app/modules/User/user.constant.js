"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionSchema = void 0;
const mongoose_1 = require("mongoose");
exports.sessionSchema = new mongoose_1.Schema({
    refreshToken: { type: String, required: true },
    deviceInfo: { type: String, default: 'unknown' },
    createdAt: { type: Date, default: Date.now },
});
