/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from '../../errors/AppError';
import { Car } from '../Car/car.model';
import { Conversation } from './conversation.model';

const getOrCreateConversation = async (buyerId: string, carId: string) => {
  const car = await Car.findById(carId);
  if (!car) throw new AppError(404, 'Car not found');

  if (car.status !== 'approved') {
    throw new AppError(400, 'This car is not available');
  }

  if (car.seller.toString() === buyerId) {
    throw new AppError(400, 'You cannot message yourself');
  }

  let conversation = await Conversation.findOne({
    car: carId,
    buyer: buyerId,
  })
    .populate('car', 'title coverImage price')
    .populate('buyer', 'name email')
    .populate('seller', 'name email');

  if (!conversation) {
    conversation = await Conversation.create({
      car: carId,
      buyer: buyerId,
      seller: car.seller,
      messages: [],
    });

    conversation = await conversation.populate([
      { path: 'car', select: 'title coverImage price' },
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' },
    ]);
  }

  return conversation;
};

const saveMessage = async (
  conversationId: string,
  senderId: string,
  content: string
) => {
  if (!content?.trim()) {
    throw new AppError(400, 'Message cannot be empty');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new AppError(404, 'Conversation not found');

  const isParticipant =
    conversation.buyer.toString() === senderId ||
    conversation.seller.toString() === senderId;

  if (!isParticipant) {
    throw new AppError(403, 'You are not part of this conversation');
  }

  conversation.messages.push({
    sender: senderId as any,
    content: content.trim(),
    createdAt: new Date(),
    isRead: false,
  });

  conversation.lastMessage = content.slice(0, 50);
  conversation.lastMessageAt = new Date();

  await conversation.save();

  const newMessage = conversation.messages[conversation.messages.length - 1];

  return newMessage;
};

const getMyConversations = async (userId: string) => {
  const conversations = await Conversation.find({
    $or: [{ buyer: userId }, { seller: userId }],
  })
    .populate('car', 'title coverImage price')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .select('-messages')
    .sort({ lastMessageAt: -1 })
    .lean();

  return conversations;
};

const getConversationMessages = async (
  conversationId: string,
  userId: string
) => {
  const conversation = await Conversation.findById(conversationId)
    .populate('car', 'title coverImage price')
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('messages.sender', 'name')
    .lean();

  if (!conversation) throw new AppError(404, 'Conversation not found');

  const isParticipant =
    conversation.buyer.toString() === userId ||
    conversation.seller.toString() === userId;

  if (!isParticipant) {
    throw new AppError(403, 'You are not part of this conversation');
  }

  await Conversation.updateMany(
    {
      _id: conversationId,
      'messages.sender': { $ne: userId },
      'messages.isRead': false,
    },
    { $set: { 'messages.$[elem].isRead': true } },
    { arrayFilters: [{ 'elem.sender': { $ne: userId } }] }
  );

  return conversation;
};

const getUnreadCount = async (userId: string) => {
  const conversations = await Conversation.find({
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
};

const deleteConversation = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new AppError(404, 'Conversation not found');

  const isParticipant =
    conversation.buyer.toString() === userId ||
    conversation.seller.toString() === userId;

  if (!isParticipant) throw new AppError(403, 'Not authorized');

  await Conversation.findByIdAndDelete(conversationId);
  return { message: 'Conversation deleted' };
};
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

export const conversationServices = {
  getOrCreateConversation,
  saveMessage,
  getMyConversations,
  getConversationMessages,
  getUnreadCount,
  deleteConversation,
  // markAllAsRead,
};
