import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Type of notification
    type: {
      type: String,
      enum: ["space_join_request", "space_join_approved", "space_join_rejected"],
      required: true,
    },

    // User who triggered the notification (requester)
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User who receives the notification (admin for requests, user for approvals)
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Related space
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },

    // Notification message
    message: {
      type: String,
      required: true,
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },

    // Status for join requests
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    // Metadata for additional info
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ to: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ space: 1, from: 1, type: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
