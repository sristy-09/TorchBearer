import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  // 🔗 Reference to Space
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    required: true,
  },

  // Optional: store posts inside topic
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Topic = mongoose.model("Topic", topicSchema);
