import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },

  // 🔗 Alumni who created this space
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Optional: store topics inside space (reverse reference)
  topics: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Space = mongoose.model("Space", spaceSchema);
