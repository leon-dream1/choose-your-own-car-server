import { model, Schema } from 'mongoose';
import { TCar } from './car.interface';

const carSchema = new Schema<TCar>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: {
      type: Number,
      required: true,
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Invalid year'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    mileage: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      enum: ['new', 'used'],
      required: true,
    },
    description: {
      type: String,
      maxlength: [2000, 'Description too long'],
    },
    coverImage: {
      type: String,
    },
    images: [{ type: String }],
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sold'],
      default: 'pending',
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

carSchema.index({ brand: 1, model: 1 });
carSchema.index({ price: 1 });
carSchema.index({ status: 1 });
carSchema.index({ seller: 1 });

export const Car = model<TCar>('Car', carSchema);
