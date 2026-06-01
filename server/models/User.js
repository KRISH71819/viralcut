/**
 * User Model
 * Stores authentication data, subscription tier, and credit balance.
 */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    passwordHash: {
      type: String,
      select: false, // Never returned in queries by default
    },
    tier: {
      type: String,
      enum: ['free', 'starter', 'pro', 'pay_per_use'],
      default: 'free',
    },
    credits: {
      type: Number,
      default: 1, // Free tier starts with 1 credit
      min: 0,
    },
    creditsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    provider: {
      type: String,
      enum: ['google', 'github', 'credentials'],
      default: 'credentials',
    },
    providerId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index for provider lookups
UserSchema.index({ provider: 1, providerId: 1 });

// Instance method to check if user has credits
UserSchema.methods.hasCredits = function () {
  if (this.tier === 'pro') return true; // Unlimited for pro
  return this.credits > this.creditsUsed;
};

// Instance method to consume a credit
UserSchema.methods.consumeCredit = async function () {
  if (this.tier !== 'pro') {
    this.creditsUsed += 1;
    await this.save();
  }
};

// Prevent model recompilation during hot reload
export default mongoose.models.User || mongoose.model('User', UserSchema);
