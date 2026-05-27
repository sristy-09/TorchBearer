import { Home, User, LogOut, ChevronRight, Bell, Hash } from "lucide-react";
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

export default function Sidebar({ isMobileOpen: _isMobileOpen = false, onMobileClose }: SidebarProps) {
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
  }, [location.pathname, onMobileClose]);

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

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed w-64 flex flex-col h-screen shrink-0"
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
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

        {/* Profile Button */}
        <button
          onClick={() => navigate("/profile")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive("/profile")
            ? "text-white shadow-sm"
            : "text-foreground/70 hover:text-foreground"
            }`}
          style={
            isActive("/profile")
              ? { background: "var(--primary)" }
              : { background: "transparent" }
          }
          onMouseEnter={(e) => {
            if (!isActive("/profile")) (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)";
          }}
          onMouseLeave={(e) => {
            if (!isActive("/profile")) (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <User size={18} />
          <span>My Profile</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
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
                              {notification.from && notification.from.avatar ? (
                                <img src={notification.from.avatar} alt={notification.from.name}
                                  className="w-9 h-9 rounded-full" />
                              ) : (
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                  style={{ background: "var(--primary)" }}>
                                  {notification.from?.name?.charAt(0).toUpperCase() || "?"}
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
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${notification.status === "pending"
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

        {/* Spaces Section */}
        <div className="px-3 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Spaces
        </div>

        {joinedSpaces.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No spaces joined yet
          </div>
        ) : (
          <div className="space-y-1">
            {joinedSpaces.slice(0, 10).map((space: any) => {
              const spaceActive = location.pathname.includes(`/space/${space._id}`);
              return (
                <button
                  key={space._id}
                  onClick={() => navigate(`/space/${space._id}/topics`)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${spaceActive
                    ? "text-white shadow-sm"
                    : "text-foreground/70 hover:text-foreground"
                    }`}
                  style={
                    spaceActive
                      ? { background: "var(--primary)" }
                      : { background: "transparent" }
                  }
                  onMouseEnter={(e) => {
                    if (!spaceActive) (e.currentTarget as HTMLElement).style.background = "var(--sidebar-accent)";
                  }}
                  onMouseLeave={(e) => {
                    if (!spaceActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                  title={space.title}
                >
                  <Hash size={18} className="flex-shrink-0" />
                  <span className="truncate">{space.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {joinedSpaces.length > 10 && (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full mt-2 px-3 py-2 text-sm font-medium text-left transition-colors"
            style={{ color: "var(--primary)" }}
          >
            View all spaces →
          </button>
        )}
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
    </div>
  );
}
