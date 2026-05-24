import { Notification } from "../models/Notification.js";
import { Space } from "../models/Spaces.js";
import { User } from "../models/User.js";
import { emitToAdmins, emitToUser } from "../config/socket.js";

/* =========================================
   REQUEST TO JOIN SPACE
   ========================================= */
export const requestToJoinSpace = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const userId = req.user._id;

    // Check if space exists
    const space = await Space.findById(spaceId).populate("createdBy", "name email");
    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    // Check if user is already a member
    if (space.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this space",
      });
    }

    // Check if there's already a pending request
    const existingRequest = await Notification.findOne({
      type: "space_join_request",
      from: userId,
      space: spaceId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this space",
      });
    }

    // Get all admins
    const admins = await User.find({ role: "admin" });

    if (admins.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No admins available to process your request",
      });
    }

    // Create notifications for all admins
    const notifications = await Promise.all(
      admins.map((admin) =>
        Notification.create({
          type: "space_join_request",
          from: userId,
          to: admin._id,
          space: spaceId,
          message: `${req.user.name} requested to join "${space.title}"`,
          status: "pending",
          metadata: {
            userName: req.user.name,
            userEmail: req.user.email,
            userRole: req.user.role,
            spaceName: space.title,
          },
        })
      )
    );

    // Populate the first notification for response
    const populatedNotification = await Notification.findById(notifications[0]._id)
      .populate("from", "name email avatar role")
      .populate("space", "title description");

    // Emit real-time notification to all admins
    emitToAdmins("notification:new", {
      notification: populatedNotification,
      message: `New join request from ${req.user.name}`,
    });

    res.status(201).json({
      success: true,
      message: "Join request sent successfully. Waiting for admin approval.",
      data: populatedNotification,
    });
  } catch (error) {
    console.error("Error in requestToJoinSpace:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   APPROVE JOIN REQUEST (Admin Only)
   ========================================= */
export const approveJoinRequest = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Find the notification
    const notification = await Notification.findById(notificationId)
      .populate("from", "name email avatar role")
      .populate("space", "title description");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if already processed
    if (notification.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${notification.status}`,
      });
    }

    // Add user to space members (atomic operation)
    const space = await Space.findByIdAndUpdate(
      notification.space._id,
      { $addToSet: { members: notification.from._id } },
      { new: true }
    );

    if (!space) {
      return res.status(404).json({
        success: false,
        message: "Space not found",
      });
    }

    // Update ALL notifications for this request (all admins have a copy)
    await Notification.updateMany(
      {
        type: "space_join_request",
        from: notification.from._id,
        space: notification.space._id,
        status: "pending",
      },
      {
        $set: {
          status: "approved",
          isRead: true,
        },
      }
    );

    // Create approval notification for the user
    const approvalNotification = await Notification.create({
      type: "space_join_approved",
      from: req.user._id,
      to: notification.from._id,
      space: notification.space._id,
      message: `Your request to join "${notification.space.title}" has been approved`,
      status: "approved",
      metadata: {
        approvedBy: req.user.name,
        spaceName: notification.space.title,
      },
    });

    const populatedApproval = await Notification.findById(approvalNotification._id)
      .populate("from", "name email avatar role")
      .populate("space", "title description");

    // Emit real-time notification to the user
    emitToUser(notification.from._id.toString(), "notification:approved", {
      notification: populatedApproval,
      message: `You've been added to ${notification.space.title}`,
    });

    // Notify all admins about the approval
    emitToAdmins("notification:request_processed", {
      notificationId,
      status: "approved",
      message: `${req.user.name} approved ${notification.from.name}'s request`,
    });

    res.status(200).json({
      success: true,
      message: "Join request approved successfully",
      data: {
        notification: populatedApproval,
        space,
      },
    });
  } catch (error) {
    console.error("Error in approveJoinRequest:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   REJECT JOIN REQUEST (Admin Only)
   ========================================= */
export const rejectJoinRequest = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { reason } = req.body;

    // Find the notification
    const notification = await Notification.findById(notificationId)
      .populate("from", "name email avatar role")
      .populate("space", "title description");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if already processed
    if (notification.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${notification.status}`,
      });
    }

    // Update ALL notifications for this request
    await Notification.updateMany(
      {
        type: "space_join_request",
        from: notification.from._id,
        space: notification.space._id,
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
          isRead: true,
        },
      }
    );

    // Create rejection notification for the user
    const rejectionNotification = await Notification.create({
      type: "space_join_rejected",
      from: req.user._id,
      to: notification.from._id,
      space: notification.space._id,
      message: `Your request to join "${notification.space.title}" has been rejected`,
      status: "rejected",
      metadata: {
        rejectedBy: req.user.name,
        spaceName: notification.space.title,
        reason: reason || "No reason provided",
      },
    });

    const populatedRejection = await Notification.findById(rejectionNotification._id)
      .populate("from", "name email avatar role")
      .populate("space", "title description");

    // Emit real-time notification to the user
    emitToUser(notification.from._id.toString(), "notification:rejected", {
      notification: populatedRejection,
      message: `Your request to join ${notification.space.title} was rejected`,
    });

    // Notify all admins about the rejection
    emitToAdmins("notification:request_processed", {
      notificationId,
      status: "rejected",
      message: `${req.user.name} rejected ${notification.from.name}'s request`,
    });

    res.status(200).json({
      success: true,
      message: "Join request rejected",
      data: populatedRejection,
    });
  } catch (error) {
    console.error("Error in rejectJoinRequest:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   GET USER NOTIFICATIONS
   ========================================= */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { to: userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate("from", "name email avatar role")
      .populate("space", "title description")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      to: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   MARK NOTIFICATION AS READ
   ========================================= */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, to: userId },
      { isRead: true },
      { new: true }
    )
      .populate("from", "name email avatar role")
      .populate("space", "title description");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   MARK ALL NOTIFICATIONS AS READ
   ========================================= */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { to: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   GET PENDING JOIN REQUESTS (Admin Only)
   ========================================= */
export const getPendingJoinRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({
      type: "space_join_request",
      to: req.user._id,
      status: "pending",
    })
      .populate("from", "name email avatar role department batchYear registrationNumber")
      .populate("space", "title description")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments({
      type: "space_join_request",
      to: req.user._id,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      data: {
        requests: notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error in getPendingJoinRequests:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
