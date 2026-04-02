"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const token_1 = require("../utils/token");
const socketHandler_1 = require("./socketHandler");
const initSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            //   origin: config.client_url || 'http://localhost:3000',
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Token required'));
        }
        try {
            const decoded = (0, token_1.verifyToken)(token, process.env.JWT_ACCESS_SECRET);
            socket.data.user = decoded;
            next();
        }
        catch (_a) {
            next(new Error('Invalid token'));
        }
    });
    // Connection হলে handler-এ পাঠাও
    io.on('connection', (socket) => {
        (0, socketHandler_1.socketHandler)(io, socket);
    });
    console.log('Socket.io initialized');
    return io;
};
exports.initSocket = initSocket;
