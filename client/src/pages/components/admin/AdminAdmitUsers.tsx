import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Menu } from "lucide-react";

function AdminAdmitUsers() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Hamburger Menu for Mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden mb-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-foreground" />
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Admit Users</h1>
            <p className="text-muted-foreground mt-2">
              Approve and manage user registrations
            </p>
          </div>

          <div className="rounded-lg shadow p-6" style={{ background: "var(--card)" }}>
            <p className="text-muted-foreground">User admission interface will be displayed here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAdmitUsers;
