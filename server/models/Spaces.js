import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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
