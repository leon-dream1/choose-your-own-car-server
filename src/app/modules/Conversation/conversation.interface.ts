import { Types } from 'mongoose';

export type TMessage = {
  // _id?: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  createdAt: Date;
  isRead: boolean;
};

export type TConversation = {
  car: Types.ObjectId;
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  messages: TMessage[];
  lastMessage?: string;
  lastMessageAt?: Date;
};
