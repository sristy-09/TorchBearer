import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { socketService } from "../../../services/socket";
import {
  addNotification,
  addPendingRequest,
  updateNotificationStatus,
  fetchNotifications,
  fetchPendingRequests,
  fetchMyPendingSpaceRequests,
} from "../../../store/Slice/notificationSlice";
import type { NotificationData } from "../api/notificationApi";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { notifications, pendingRequests, unreadCount, loading } =
    useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (!token || !user) return;

    // Connect socket
    socketService.connect(token);

    // Fetch initial notifications
    dispatch(fetchNotifications());

    if (user.role === "admin") {
      // Admin: fetch pending join requests for the dashboard
      dispatch(fetchPendingRequests());
    } else {
      // Regular user: fetch which spaces they have pending requests for
      // This ensures the "Request Sent / Cancel" state persists across reloads
      dispatch(fetchMyPendingSpaceRequests());
    }

    // Listen for new notifications
    const handleNewNotification = (data: { notification: NotificationData }) => {
      console.log("New notification received:", data);
      dispatch(addNotification(data.notification));

      // If it's a join request and user is admin, add to pending requests
      if (
        user.role === "admin" &&
        data.notification.type === "space_join_request"
      ) {
        dispatch(addPendingRequest(data.notification));
      }

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("TorchBearer", {
          body: data.notification.message,
          icon: "/vite.svg",
        });
      }
    };

    // Listen for approval notifications
    const handleApproved = (data: { notification: NotificationData }) => {
      console.log("✅ Request approved:", data);
      dispatch(addNotification(data.notification));

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Request Approved! 🎉", {
          body: data.notification.message,
          icon: "/vite.svg",
        });
      }
    };

    // Listen for rejection notifications
    const handleRejected = (data: { notification: NotificationData }) => {
      console.log("❌ Request rejected:", data);
      dispatch(addNotification(data.notification));

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Request Rejected", {
          body: data.notification.message,
          icon: "/vite.svg",
        });
      }
    };

    // Listen for request processed (admin only) — covers approve, reject, and cancel
    const handleRequestProcessed = (data: {
      notificationId?: string;
      status: string;
    }) => {
      console.log("🔄 Request processed:", data);
      if (data.notificationId) {
        dispatch(
          updateNotificationStatus({
            notificationId: data.notificationId,
            status: data.status,
          })
        );
      }
      // If admin, re-fetch pending requests to reflect cancellations
      if (user.role === "admin" && data.status === "cancelled") {
        dispatch(fetchPendingRequests());
      }
    };

    // Register event listeners
    socketService.on("notification:new", handleNewNotification);
    socketService.on("notification:approved", handleApproved);
    socketService.on("notification:rejected", handleRejected);
    socketService.on("notification:request_processed", handleRequestProcessed);

    // Cleanup
    return () => {
      socketService.off("notification:new", handleNewNotification);
      socketService.off("notification:approved", handleApproved);
      socketService.off("notification:rejected", handleRejected);
      socketService.off("notification:request_processed", handleRequestProcessed);
    };
  }, [token, user, dispatch]);

  return {
    notifications,
    pendingRequests,
    unreadCount,
    loading,
  };
};

// Hook to request browser notification permission
export const useNotificationPermission = () => {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);
};
