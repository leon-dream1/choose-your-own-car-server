"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
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
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'paid', 'cancelled'],
        default: 'pending',
    },
    transactionId: { type: String },
    paidAt: { type: Date },
}, { timestamps: true });
orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ car: 1 });
exports.Order = (0, mongoose_1.model)('Order', orderSchema);
