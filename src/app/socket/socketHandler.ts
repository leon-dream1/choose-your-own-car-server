/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from 'socket.io';
import { conversationServices } from '../modules/Conversation/conversation.service';

export const socketHandler = (io: Server, socket: Socket) => {
  const user = socket.data.user;
  console.log(`Connected: ${user.name} (${user.email})`);

  socket.on('join:conversation', (conversationId: string) => {
    if (!conversationId) return;

    socket.join(conversationId);
    console.log(`${user.name} joined room: ${conversationId}`);

    socket.emit('joined:conversation', { conversationId });
  });

  socket.on(
    'send:message',
    async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;

        // save to mongoDB
        const newMessage = await conversationServices.saveMessage(
          conversationId,
          user._id,
          content
        );

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
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    }
  );
  socket.on('typing:start', (conversationId: string) => {
    socket.to(conversationId).emit('typing:start', {
      userId: user._id,
      name: user.name,
    });
  });

  socket.on('typing:stop', (conversationId: string) => {
    socket.to(conversationId).emit('typing:stop', {
      userId: user._id,
    });
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${user.name}`);
  });
};
