import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Search, Loader2, Calendar, Mail, GraduationCap, Briefcase, Filter } from "lucide-react";
import { fetchAllUsers, type User } from "../../../feature/Profile/api/adminUserApi";
import { Avatar } from "../../../feature/core/components/ui/avatar";

function AdminUsersList() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAppSelector((state) => state.auth);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, currentUser, navigate]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === "admin") {
      loadUsers();
    }
  }, [isAuthenticated, currentUser, searchQuery, roleFilter, departmentFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers({
        keyword: searchQuery,
        role: roleFilter,
        department: departmentFilter,
      });
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  const handleDepartmentFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartmentFilter(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "alumni":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated || currentUser?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Users List</h1>
            <p className="text-gray-600 mt-2">
              View and manage all registered users
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by name..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={roleFilter}
                onChange={handleRoleFilter}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="alumni">Alumni</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery || roleFilter || departmentFilter
                    ? "No users found matching your filters."
                    : "No users available yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              {user.registrationNumber && (
                                <div className="text-xs text-gray-500">
                                  Reg: {user.registrationNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={16} className="text-gray-400" />
                            <span className="truncate max-w-xs">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.department ? (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Briefcase size={16} className="text-gray-400" />
                              <span>{user.department}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.batchYear ? (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <GraduationCap size={16} className="text-gray-400" />
                              <span>{user.batchYear}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats */}
          {!loading && users.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {users.length} user{users.length !== 1 ? "s" : ""}
              </div>
              <div className="flex gap-4">
                <span>
                  Admins: {users.filter((u) => u.role === "admin").length}
                </span>
                <span>
                  Alumni: {users.filter((u) => u.role === "alumni").length}
                </span>
                <span>
                  Students: {users.filter((u) => u.role === "student").length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsersList;
