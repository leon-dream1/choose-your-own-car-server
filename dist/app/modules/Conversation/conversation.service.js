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
exports.conversationServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../errors/AppError"));
const car_model_1 = require("../Car/car.model");
const conversation_model_1 = require("./conversation.model");
const getOrCreateConversation = (buyerId, carId) => __awaiter(void 0, void 0, void 0, function* () {
    const car = yield car_model_1.Car.findById(carId);
    if (!car)
        throw new AppError_1.default(404, 'Car not found');
    if (car.status !== 'approved') {
        throw new AppError_1.default(400, 'This car is not available');
    }
    if (car.seller.toString() === buyerId) {
        throw new AppError_1.default(400, 'You cannot message yourself');
    }
    let conversation = yield conversation_model_1.Conversation.findOne({
        car: carId,
        buyer: buyerId,
    })
        .populate('car', 'title coverImage price')
        .populate('buyer', 'name email')
        .populate('seller', 'name email');
    if (!conversation) {
        conversation = yield conversation_model_1.Conversation.create({
            car: carId,
            buyer: buyerId,
            seller: car.seller,
            messages: [],
        });
        conversation = yield conversation.populate([
            { path: 'car', select: 'title coverImage price' },
            { path: 'buyer', select: 'name email' },
            { path: 'seller', select: 'name email' },
        ]);
    }
    return conversation;
});
const saveMessage = (conversationId, senderId, content) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(content === null || content === void 0 ? void 0 : content.trim())) {
        throw new AppError_1.default(400, 'Message cannot be empty');
    }
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation)
        throw new AppError_1.default(404, 'Conversation not found');
    const isParticipant = conversation.buyer.toString() === senderId ||
        conversation.seller.toString() === senderId;
    if (!isParticipant) {
        throw new AppError_1.default(403, 'You are not part of this conversation');
    }
    conversation.messages.push({
        sender: senderId,
        content: content.trim(),
        createdAt: new Date(),
        isRead: false,
    });
    conversation.lastMessage = content.slice(0, 50);
    conversation.lastMessageAt = new Date();
    yield conversation.save();
    const newMessage = conversation.messages[conversation.messages.length - 1];
    return newMessage;
});
const getMyConversations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield conversation_model_1.Conversation.find({
        $or: [{ buyer: userId }, { seller: userId }],
    })
        .populate('car', 'title coverImage price')
        .populate('buyer', 'name email')
        .populate('seller', 'name email')
        .select('-messages')
        .sort({ lastMessageAt: -1 })
        .lean();
    return conversations;
});
const getConversationMessages = (conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield conversation_model_1.Conversation.findById(conversationId)
        .populate('car', 'title coverImage price')
        .populate('buyer', 'name email')
        .populate('seller', 'name email')
        .populate('messages.sender', 'name')
        .lean();
    if (!conversation)
        throw new AppError_1.default(404, 'Conversation not found');
    const isParticipant = conversation.buyer.toString() === userId ||
        conversation.seller.toString() === userId;
    if (!isParticipant) {
        throw new AppError_1.default(403, 'You are not part of this conversation');
    }
    yield conversation_model_1.Conversation.updateMany({
        _id: conversationId,
        'messages.sender': { $ne: userId },
        'messages.isRead': false,
    }, { $set: { 'messages.$[elem].isRead': true } }, { arrayFilters: [{ 'elem.sender': { $ne: userId } }] });
    return conversation;
});
const getUnreadCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield conversation_model_1.Conversation.find({
        $or: [{ buyer: userId }, { seller: userId }],
    }).lean();
    let totalUnread = 0;
    conversations.forEach((conv) => {
        conv.messages.forEach((msg) => {
            if (msg.sender.toString() !== userId && !msg.isRead) {
                totalUnread++;
            }
        });
    });
    return { unreadCount: totalUnread };
});
const deleteConversation = (conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation)
        throw new AppError_1.default(404, 'Conversation not found');
    const isParticipant = conversation.buyer.toString() === userId ||
        conversation.seller.toString() === userId;
    if (!isParticipant)
        throw new AppError_1.default(403, 'Not authorized');
    yield conversation_model_1.Conversation.findByIdAndDelete(conversationId);
    return { message: 'Conversation deleted' };
});
// const markAllAsRead = async (conversationId: string, userId: string) => {
//   const conversation = await Conversation.findById(conversationId);
//   if (!conversation) throw new AppError(404, 'Conversation not found');
//   const isParticipant =
//     conversation.buyer.toString() === userId ||
//     conversation.seller.toString() === userId;
//   if (!isParticipant) throw new AppError(403, 'Not authorized');
//   conversation.messages.forEach((msg) => {
//     if (msg.sender.toString() !== userId) {
//       msg.isRead = true;
//     }
//   });
//   await conversation.save();
//   return { message: 'All messages marked as read' };
// };
exports.conversationServices = {
    getOrCreateConversation,
    saveMessage,
    getMyConversations,
    getConversationMessages,
    getUnreadCount,
    deleteConversation,
    // markAllAsRead,
};
