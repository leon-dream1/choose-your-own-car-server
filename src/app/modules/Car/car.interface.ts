import { Types } from 'mongoose';
import { TCarCondition, TCarStatus } from './car.constant';

export type TCar = {
  seller: Types.ObjectId;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: TCarCondition;
  description: string;
  images: string[];
  location: string;
  status: TCarStatus;
  isFeatured: boolean;
};
