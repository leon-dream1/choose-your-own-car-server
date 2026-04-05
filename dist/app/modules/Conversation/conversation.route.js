"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const conversation_validation_1 = require("./conversation.validation");
const conversation_controller_1 = require("./conversation.controller");
const router = (0, express_1.Router)();
router.post('/start', (0, auth_1.default)('user', 'seller'), (0, validateRequest_1.default)(conversation_validation_1.conversationValidation.startConversationSchema), conversation_controller_1.conversationControllers.startConversation);
router.get('/unread-count', (0, auth_1.default)('user', 'seller'), conversation_controller_1.conversationControllers.getUnreadCount);
router.get('/', (0, auth_1.default)('user', 'seller'), conversation_controller_1.conversationControllers.getMyConversations);
router.get('/:id/messages', (0, auth_1.default)('user', 'seller'), conversation_controller_1.conversationControllers.getMessages);
router.delete('/:id', (0, auth_1.default)('user', 'seller'), conversation_controller_1.conversationControllers.deleteConversation);
// router.patch(
//   '/:id/messages/read',
//   auth('user', 'seller'),
//   conversationControllers.markAllAsRead
// );
exports.conversationRoutes = router;
