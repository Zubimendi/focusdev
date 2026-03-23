import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@focus/shared';

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  name?: string;
  role: string;
  image?: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    image: { type: String },
    password: { type: String, select: false },
  },
  { timestamps: true }
);

// Virtual for id
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are serialized
UserSchema.set('toJSON', {
  virtuals: true,
});

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
