import { Home, Users, Star, User, LogOut, ChevronRight, Bell, Hash, Settings, Menu, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutUser } from "../../../store/Slice/authSlice";
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Avatar } from "./ui/avatar";
import { useNotifications } from "../../Notifications/hooks/useNotifications";
import { markAllAsRead } from "../../../store/Slice/notificationSlice";
import { formatDistanceToNow } from "../lib/utils";
import { fetchSpaces } from "../../../store/Slice/spacesSlice";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useNotifications();
  const { spaces } = useAppSelector((state) => state.spaces);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch spaces on mount to populate sidebar
  useEffect(() => {
    dispatch(fetchSpaces({}));
  }, [dispatch]);

  // Get user's joined spaces (members is an array of user IDs)
  const joinedSpaces = spaces.filter(
    (space) => space.members?.includes(user?._id || "")
  );

  // Close mobile menu when route changes
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

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
    } catch {
      navigate("/login");
    }
    setIsMenuOpen(false);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Clock, label: "Recent", path: null },
    { icon: Star, label: "Starred", path: null },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 w-64 bg-white border-r flex flex-col h-screen z-50 transition-transform duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="px-5 py-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <span className="font-semibold text-gray-900">TorchBearer</span>
            </button>

            {/* Close button for mobile */}
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {/* Main Navigation */}
          <button
            onClick={() => handleNavigation("/dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive("/dashboard")
              ? "bg-orange-50 text-orange-600"
              : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <Home size={20} />
            <span className="text-sm font-medium">Home</span>
          </button>
    <div className="w-64 flex flex-col h-screen shrink-0"
      style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}>

      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)" }}>
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="font-semibold text-foreground tracking-tight">TorchBearer</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = path ? isActive(path) : false;
          return (
            <button
              key={label}
              onClick={() => path && navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "text-white shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              }`}
              style={
                active
                  ? { background: "var(--primary)" }
                  : { background: "transparent" }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}

          <button
            onClick={() => handleNavigation("/profile")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive("/profile")
              ? "bg-orange-50 text-orange-600"
              : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <User size={20} />
            <span className="text-sm font-medium">My Profile</span>
          </button>

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
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-foreground/70 hover:text-foreground"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <div className="relative">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white rounded-full"
                  style={{ background: "var(--primary)" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span>Notifications</span>
          </button>

          {isNotificationOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
              <div className="fixed left-64 top-32 w-96 rounded-2xl shadow-2xl border z-50 max-h-[600px] flex flex-col overflow-hidden"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <h3 className="text-base font-semibold text-foreground">Notifications</h3>
                </div>

                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center text-muted-foreground">
                      <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    <div style={{ borderTop: "none" }}>
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className="px-5 py-3.5 transition-colors"
                          style={{
                            background: !notification.isRead ? "var(--accent)" : "transparent",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {notification.from.avatar ? (
                                <img src={notification.from.avatar} alt={notification.from.name}
                                  className="w-9 h-9 rounded-full" />
                              ) : (
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                  style={{ background: "var(--primary)" }}>
                                  {notification.from.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground leading-snug">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                style={{ background: "var(--primary)" }} />
                            )}
                          </div>
                          {notification.type === "space_join_request" && (
                            <div className="mt-2 ml-12">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                notification.status === "pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : notification.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              }`}>
                                {notification.status}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* My Spaces Section */}
          <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            My Spaces
          </div>

          {joinedSpaces.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No spaces joined yet
            </div>
          ) : (
            <div className="space-y-1">
              {joinedSpaces.slice(0, 10).map((space: any) => (
                <button
                  key={space._id}
                  onClick={() => handleNavigation(`/space/${space._id}/topics`)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${location.pathname.includes(`/space/${space._id}`)
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-900 hover:bg-gray-50"
                    }`}
                  title={space.title}
                >
                  <Hash size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{space.title}</span>
                </button>
              ))}
            </div>
          )}

          {joinedSpaces.length > 10 && (
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="w-full mt-2 px-3 py-2 text-sm text-orange-600 hover:text-orange-700 font-medium text-left"
            >
              View all spaces →
            </button>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="border-t flex-shrink-0">
          {/* Collapsible Menu */}
          {isMenuOpen && (
            <div className="px-3 py-3 space-y-1 border-b bg-gray-50">
              <button
                onClick={() => { handleNavigation("/profile"); setIsMenuOpen(false); }}
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
                {notifications.length > 0 && (
                  <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid var(--border)" }}>
                    <button onClick={() => setIsNotificationOpen(false)}
                      className="text-sm font-medium transition-colors"
                      style={{ color: "var(--primary)" }}>
                      Close
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-3 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Spaces
        </div>
      </nav>

      {/* User Profile */}
      <div style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        {isMenuOpen && (
          <div className="px-3 py-3 space-y-1" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
            <button
              onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground transition-all"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <User size={17} />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 transition-all"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <LogOut size={17} />
              <span>Log out</span>
            </button>
          </div>
        )}

        {user && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full px-4 py-3.5 flex items-center gap-3 transition-colors cursor-pointer"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <ChevronRight
              size={15}
              className={`text-muted-foreground transition-transform ${isMenuOpen ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>
    </>
  );
}
