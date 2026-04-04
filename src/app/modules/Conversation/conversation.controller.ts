import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { conversationServices } from './conversation.service';

const startConversation = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user!._id;
  const { carId } = req.body;

  const result = await conversationServices.getOrCreateConversation(
    buyerId,
    carId
  );

  res.status(200).json({
    success: true,
    message: 'Conversation ready',
    data: result,
  });
});

const getMyConversations = catchAsync(async (req: Request, res: Response) => {
  const result = await conversationServices.getMyConversations(req.user!._id);

  res.status(200).json({
    success: true,
    message: 'Conversations retrieved',
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const result = await conversationServices.getConversationMessages(
    req.params.id,
    req.user!._id
  );

  res.status(200).json({
    success: true,
    message: 'Messages retrieved',
    data: result,
  });
});

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const result = await conversationServices.getUnreadCount(req.user!._id);

  res.status(200).json({
    success: true,
    message: 'Unread count retrieved',
    data: result,
  });
});

const deleteConversation = catchAsync(async (req: Request, res: Response) => {
  const result = await conversationServices.deleteConversation(
    req.params.id,
    req.user!._id
  );
  res.status(200).json({ success: true, message: result.message, data: null });
});

// const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
//   const result = await conversationServices.markAllAsRead(
//     req.params.id,
//     req.user!._id
//   );
//   res.status(200).json({ success: true, message: result.message, data: null });
// });

export const conversationControllers = {
  startConversation,
  getMyConversations,
  getMessages,
  getUnreadCount,
  deleteConversation,
  // markAllAsRead,
};
