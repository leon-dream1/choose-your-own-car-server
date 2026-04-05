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
exports.conversationControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const conversation_service_1 = require("./conversation.service");
const startConversation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const buyerId = req.user._id;
    const { carId } = req.body;
    const result = yield conversation_service_1.conversationServices.getOrCreateConversation(buyerId, carId);
    res.status(200).json({
        success: true,
        message: 'Conversation ready',
        data: result,
    });
}));
const getMyConversations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield conversation_service_1.conversationServices.getMyConversations(req.user._id);
    res.status(200).json({
        success: true,
        message: 'Conversations retrieved',
        data: result,
    });
}));
const getMessages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield conversation_service_1.conversationServices.getConversationMessages(req.params.id, req.user._id);
    res.status(200).json({
        success: true,
        message: 'Messages retrieved',
        data: result,
    });
}));
const getUnreadCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield conversation_service_1.conversationServices.getUnreadCount(req.user._id);
    res.status(200).json({
        success: true,
        message: 'Unread count retrieved',
        data: result,
    });
}));
const deleteConversation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield conversation_service_1.conversationServices.deleteConversation(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: result.message, data: null });
}));
// const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
//   const result = await conversationServices.markAllAsRead(
//     req.params.id,
//     req.user!._id
//   );
//   res.status(200).json({ success: true, message: result.message, data: null });
// });
exports.conversationControllers = {
    startConversation,
    getMyConversations,
    getMessages,
    getUnreadCount,
    deleteConversation,
    // markAllAsRead,
};
