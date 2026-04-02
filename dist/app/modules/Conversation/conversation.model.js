"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Message too long'],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const conversationSchema = new mongoose_1.Schema({
    car: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    buyer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    seller: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    messages: [messageSchema],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
}, { timestamps: true });
conversationSchema.index({ buyer: 1, seller: 1, car: 1 });
conversationSchema.index({ lastMessageAt: -1 });
exports.Conversation = (0, mongoose_1.model)('Conversation', conversationSchema);
