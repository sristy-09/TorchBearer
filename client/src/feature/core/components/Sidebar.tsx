import { Home, Clock, Star, User, LogOut, ChevronRight, Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutUser } from "../../../store/Slice/authSlice";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Avatar } from "./ui/avatar";
import { useNotifications } from "../../Notifications/hooks/useNotifications";
import { markAllAsRead } from "../../../store/Slice/notificationSlice";
import { formatDistanceToNow } from "../lib/utils";

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Mark all notifications as read when dropdown opens
  useEffect(() => {
    if (isNotificationOpen && unreadCount > 0) {
      dispatch(markAllAsRead());
    }
  }, [isNotificationOpen, unreadCount, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="fixed left-0 top-0 w-64 bg-white border-r flex flex-col h-screen z-30">
      {/* Logo Section */}
      <div className="px-5 py-6 border-b flex-shrink-0">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="font-semibold text-gray-900">TorchBearer</span>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
          <Home size={20} />
          <span className="text-sm font-medium">Home</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
          <Clock size={20} />
          <span className="text-sm font-medium">Recent</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
          <Star size={20} />
          <span className="text-sm font-medium">Starred</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
          >
            <div className="relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium">Notifications</span>
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <>
              {/* Backdrop - Fully transparent */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationOpen(false)}
              />

              {/* Notification Panel */}
              <div className="fixed left-64 top-32 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.isRead ? "bg-blue-50" : ""
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {notification.from.avatar ? (
                                <img
                                  src={notification.from.avatar}
                                  alt={notification.from.name}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                  {notification.from.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(notification.createdAt)}
                              </p>
                            </div>

                            {/* Unread indicator */}
                            {!notification.isRead && (
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              </div>
                            )}
                          </div>

                          {/* Status badge */}
                          {notification.type === "space_join_request" && (
                            <div className="mt-2 ml-13">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${notification.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : notification.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {notification.status}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-gray-200 text-center">
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Spaces
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t flex-shrink-0">
        {/* Collapsible Menu */}
        {isMenuOpen && (
          <div className="px-3 py-3 space-y-1 border-b bg-gray-50">
            <button
              onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white rounded-md cursor-pointer transition-colors"
            >
              <User size={18} />
              <span className="text-sm font-medium">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white rounded-md cursor-pointer transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        )}

        {/* User Info - Clickable */}
        {user && (
          <button
            onClick={toggleMenu}
            className="w-full px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <ChevronRight
              size={16}
              className={`text-gray-400 transition-transform ${isMenuOpen ? "rotate-90" : ""
                }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}