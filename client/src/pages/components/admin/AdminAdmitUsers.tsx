import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { UserPlus } from "lucide-react";

function AdminAdmitUsers() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Admit Users</h1>
            <p className="text-muted-foreground mt-1 text-sm">Approve and manage user registrations</p>
          </div>

          <div className="rounded-2xl border p-12 text-center"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--secondary)" }}>
              <UserPlus size={24} style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-muted-foreground text-sm">User admission interface will be displayed here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAdmitUsers;
