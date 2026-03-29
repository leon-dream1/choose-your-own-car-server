import { model, Schema } from 'mongoose';
import { TUser } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';
import { sessionSchema } from './user.constant';

export const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 25,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'seller', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    isVerified: { type: Boolean, default: false },
    sessions: [sessionSchema],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password') && this.password) {
      this.password = await bcrypt.hash(
        this.password,
        Number(config.bcrypt_salt_rounds)
      );
    }

    next();
  } catch (err: any) {
    next(err); // pass error to Mongoose error handler
  }
});

export const User = model<TUser>('User', userSchema);
