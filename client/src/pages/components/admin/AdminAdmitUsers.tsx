import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";

function AdminAdmitUsers() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admit Users</h1>
            <p className="text-gray-600 mt-2">
              Approve and manage user registrations
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">User admission interface will be displayed here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAdmitUsers;
