import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import AdminSidebar from "../../feature/core/components/AdminSidebar";
import { useNotifications } from "../../feature/Notifications/hooks/useNotifications";
import { fetchAdminStats } from "../../store/Slice/adminSlice";
import { FaUsers, FaComments, FaLayerGroup } from "react-icons/fa";
import { Bell, Menu } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  gradient: string;
  onClick?: () => void;
  clickable?: boolean;
}

function StatCard({ icon, title, value, gradient, onClick, clickable }: StatCardProps) {
  const Component = clickable ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      className={`rounded-2xl p-6 border transition-all ${clickable ? "cursor-pointer hover:shadow-lg" : ""}`}
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
          style={{ background: gradient }}>
          {icon}
        </div>
      </div>
    </Component>
  );
}

interface ActionButtonProps {
  title: string;
  description: string;
  onClick: () => void;
  badge?: number;
}

function ActionButton({ title, description, onClick, badge }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-5 rounded-2xl border transition-all group"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
        (e.currentTarget as HTMLElement).style.background = "var(--secondary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.background = "var(--background)";
      }}
    >
      <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2 text-sm">
        {title}
        {badge !== undefined && badge > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white rounded-full"
            style={{ background: "#EF4444" }}>
            {badge}
          </span>
        )}
      </h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { pendingRequests } = useNotifications();
  const { stats, loading: statsLoading } = useAppSelector((state) => state.admin);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Fetch admin stats when component mounts
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchAdminStats());
    }
  }, [isAuthenticated, user, dispatch]);

  // Don't render if not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hamburger Menu for Mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden mb-4 p-2 rounded-lg transition-colors"
            style={{ background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--hover-bg)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            aria-label="Open menu"
          >
            <Menu size={24} className="text-foreground" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 rounded-full" style={{ background: "var(--primary)" }} />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overview</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Welcome back, <span className="font-medium text-foreground">{user?.name}</span>! Manage your platform from here.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              icon={<FaUsers className="w-5 h-5" />}
              title="Total Users"
              value={statsLoading ? "..." : stats?.totalUsers.toString() || "0"}
              gradient="linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)"
            />
            <StatCard
              icon={<FaLayerGroup className="w-5 h-5" />}
              title="Total Spaces"
              value={statsLoading ? "..." : stats?.totalSpaces.toString() || "0"}
              gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            />
            <StatCard
              icon={<FaComments className="w-5 h-5" />}
              title="Total Topics"
              value={statsLoading ? "..." : stats?.totalTopics.toString() || "0"}
              gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
            />
            <StatCard
              icon={<Bell className="w-5 h-5" />}
              title="Pending Requests"
              value={pendingRequests.length.toString()}
              gradient="linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
              onClick={() => navigate("/admin/pending-requests")}
              clickable
            />
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl p-6 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="text-base font-semibold text-foreground mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActionButton
                title="Manage Users"
                description="View and manage all users"
                onClick={() => navigate("/admin/users")}
              />
              <ActionButton
                title="Manage Spaces"
                description="View and manage all spaces"
                onClick={() => navigate("/admin/spaces")}
              />
              <ActionButton
                title="Pending Requests"
                description="Review space join requests"
                onClick={() => navigate("/admin/pending-requests")}
                badge={pendingRequests.length > 0 ? pendingRequests.length : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
