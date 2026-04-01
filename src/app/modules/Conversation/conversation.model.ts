import { model, Schema } from 'mongoose';
import { TConversation, TMessage } from './conversation.interface';

const messageSchema = new Schema<TMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message too long'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const conversationSchema = new Schema<TConversation>(
  {
    car: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [messageSchema],

    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

conversationSchema.index({ buyer: 1, seller: 1, car: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = model<TConversation>(
  'Conversation',
  conversationSchema
);
