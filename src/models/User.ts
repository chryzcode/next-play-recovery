import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'parent';
  children: mongoose.Types.ObjectId[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  consent_text: string;
  consent_version: string;
  consent_timestamp: Date;
  consent_accepted: boolean;
  isThirteenOrOlder: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'parent'],
    default: 'parent',
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
  }],
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationExpires: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  consent_text: {
    type: String,
    required: true,
    default: 'I understand that Next Play Recovery (including the Resource Center) is for informational use only and not medical advice. I agree to the Terms of Use, Privacy Policy, and Disclaimer, consent to the storage of my data (including optional photos), and confirm I am 13 or older (with parent/guardian consent if under 18).',
  },
  consent_version: {
    type: String,
    required: true,
    default: 'v1.0',
  },
  consent_timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  consent_accepted: {
    type: Boolean,
    required: true,
    default: false,
  },
  isThirteenOrOlder: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 