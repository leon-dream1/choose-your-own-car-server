import { Server } from 'socket.io';
// import config from '../config';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/token';
import { socketHandler } from './socketHandler';

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
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
      const decoded = verifyToken(
        token,
        process.env.JWT_ACCESS_SECRET as string
      );

      socket.data.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // Connection হলে handler-এ পাঠাও
  io.on('connection', (socket) => {
    socketHandler(io, socket);
  });

  console.log('Socket.io initialized');
  return io;
};
