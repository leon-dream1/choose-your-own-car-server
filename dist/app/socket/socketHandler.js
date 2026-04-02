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
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = void 0;
const conversation_service_1 = require("../modules/Conversation/conversation.service");
const socketHandler = (io, socket) => {
    const user = socket.data.user;
    console.log(`Connected: ${user.name} (${user.email})`);
    socket.on('join:conversation', (conversationId) => {
        if (!conversationId)
            return;
        socket.join(conversationId);
        console.log(`${user.name} joined room: ${conversationId}`);
        socket.emit('joined:conversation', { conversationId });
    });
    socket.on('send:message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { conversationId, content } = data;
            // save to mongoDB
            const newMessage = yield conversation_service_1.conversationServices.saveMessage(conversationId, user._id, content);
            io.to(conversationId).emit('receive:message', {
                conversationId,
                message: {
                    // _id: newMessage._id,
                    content: newMessage.content,
                    createdAt: newMessage.createdAt,
                    isRead: newMessage.isRead,
                    sender: {
                        _id: user._id,
                        name: user.name,
                    },
                },
            });
        }
        catch (err) {
            socket.emit('error', { message: err.message });
        }
    }));
    socket.on('typing:start', (conversationId) => {
        socket.to(conversationId).emit('typing:start', {
            userId: user._id,
            name: user.name,
        });
    });
    socket.on('typing:stop', (conversationId) => {
        socket.to(conversationId).emit('typing:stop', {
            userId: user._id,
        });
    });
    socket.on('disconnect', () => {
        console.log(`Disconnected: ${user.name}`);
    });
};
exports.socketHandler = socketHandler;
