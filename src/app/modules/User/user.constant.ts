import { Schema } from 'mongoose';

export type TRole = 'user' | 'seller' | 'admin';

export type TSession = {
  refreshToken: string;
  deviceInfo: string;
  createdAt: Date;
};

export const sessionSchema = new Schema({
  refreshToken: { type: String, required: true },
  deviceInfo: { type: String, default: 'unknown' },
  createdAt: { type: Date, default: Date.now },
});
