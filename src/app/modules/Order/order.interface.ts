import { Types } from 'mongoose';
import { TOrderStatus } from './order.constants';

export type TOrder = {
  car: Types.ObjectId;
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  price: number;
  status: TOrderStatus;
  transactionId?: string;
  paidAt?: Date;
};
