import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../store/hooks";
import AdminSidebar from "../../feature/core/components/AdminSidebar";
import { FaUsers, FaComments, FaLayerGroup, FaChartLine } from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render if not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! Manage your platform from here.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FaUsers className="w-6 h-6" />}
              title="Total Users"
              value="0"
              bgColor="bg-blue-500"
            />
            <StatCard
              icon={<FaLayerGroup className="w-6 h-6" />}
              title="Total Spaces"
              value="0"
              bgColor="bg-green-500"
            />
            <StatCard
              icon={<FaComments className="w-6 h-6" />}
              title="Total Topics"
              value="0"
              bgColor="bg-purple-500"
            />
            <StatCard
              icon={<FaChartLine className="w-6 h-6" />}
              title="Total Posts"
              value="0"
              bgColor="bg-orange-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
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
                title="View Reports"
                description="Check system reports"
                onClick={() => navigate("/admin/reports")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  bgColor: string;
}

function StatCard({ icon, title, value, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Action Button Component
interface ActionButtonProps {
  title: string;
  description: string;
  onClick: () => void;
}

function ActionButton({ title, description, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
    >
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

export default AdminDashboard;
