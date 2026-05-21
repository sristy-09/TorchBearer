import express from "express";
import {
  requestToJoinSpace,
  approveJoinRequest,
  rejectJoinRequest,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getPendingJoinRequests,
} from "../controllers/notificationController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post("/request-join/:spaceId", requestToJoinSpace); // Request to join a space
router.get("/", getUserNotifications); // Get user's notifications
router.patch("/:notificationId/read", markNotificationAsRead); // Mark single notification as read
router.patch("/read-all", markAllNotificationsAsRead); // Mark all notifications as read

// Admin routes
router.get("/pending-requests", restrictTo("admin"), getPendingJoinRequests); // Get pending join requests
router.patch("/:notificationId/approve", restrictTo("admin"), approveJoinRequest); // Approve join request
router.patch("/:notificationId/reject", restrictTo("admin"), rejectJoinRequest); // Reject join request

export default router;
