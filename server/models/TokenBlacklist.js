import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800, // Auto-delete after 7 days (matches JWT expiry)
  },
});

// Index for faster lookups
tokenBlacklistSchema.index({ token: 1 });
tokenBlacklistSchema.index({ expiresAt: 1 });

export const TokenBlacklist = mongoose.model("TokenBlacklist", tokenBlacklistSchema);
