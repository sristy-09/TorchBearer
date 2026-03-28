import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  image: {
    type: String,
  },

  // 🔗 Reference to Topic
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },

  // 🔗 Optional: direct reference to Space (for faster queries)
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Post = mongoose.model("Post", postSchema);
