import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
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

  // 🔗 Alumni who created this topic
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // 🔗 Reference to Space
  space: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Space",
    required: [true, "Space is required"],
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
