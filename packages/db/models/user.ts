import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@focus/shared';

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  name?: string;
  role: string;
  image?: string;
  githubAccessToken?: string;
  githubTokenExpiry?: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    image: { type: String },
    password: { type: String, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    githubAccessToken: { type: String, select: false },
    githubTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

// Explicit unique index — guarantees DB-level enforcement
UserSchema.index({ email: 1 }, { unique: true });

// Virtual for id
UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are serialized
UserSchema.set('toJSON', {
  virtuals: true,
});

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
