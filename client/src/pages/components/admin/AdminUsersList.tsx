import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../store/hooks";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Search, Loader2, Calendar, Mail, GraduationCap, Briefcase, Filter } from "lucide-react";
import { fetchAllUsers, type User } from "../../../feature/Profile/api/adminUserApi";
import { Avatar } from "../../../feature/core/components/ui/avatar";

const roleBadgeStyle: Record<string, { bg: string; color: string }> = {
  admin: { bg: "rgba(139,92,246,0.12)", color: "#8B5CF6" },
  alumni: { bg: "rgba(59,130,246,0.12)", color: "#3B82F6" },
  student: { bg: "rgba(16,185,129,0.12)", color: "#10B981" },
};

function AdminUsersList() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAppSelector((state) => state.auth);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, currentUser, navigate]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === "admin") loadUsers();
  }, [isAuthenticated, currentUser, searchQuery, roleFilter, departmentFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers({ keyword: searchQuery, role: roleFilter, department: departmentFilter });
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (!isAuthenticated || currentUser?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Users List</h1>
            <p className="text-muted-foreground mt-1 text-sm">View and manage all registered users</p>
          </div>

          {/* Filters */}
          <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="alumni">Alumni</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="animate-spin w-7 h-7" style={{ color: "var(--primary)" }} />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground text-sm">
                {searchQuery || roleFilter || departmentFilter
                  ? "No users found matching your filters."
                  : "No users available yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                    <tr>
                      {["User", "Email", "Role", "Department", "Batch Year", "Joined"].map((h) => (
                        <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const badge = roleBadgeStyle[user.role] || { bg: "var(--muted)", color: "var(--muted-foreground)" };
                      return (
                        <tr key={user._id} className="transition-colors"
                          style={{ borderBottom: "1px solid var(--border)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--background)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={user.name} avatarUrl={user.avatar} size="md" />
                              <div>
                                <div className="text-sm font-medium text-foreground">{user.name}</div>
                                {user.registrationNumber && (
                                  <div className="text-xs text-muted-foreground">Reg: {user.registrationNumber}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail size={13} />
                              <span className="truncate max-w-xs">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                              style={{ background: badge.bg, color: badge.color }}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {user.department ? (
                              <div className="flex items-center gap-1.5 text-sm text-foreground">
                                <Briefcase size={13} className="text-muted-foreground" />
                                <span>{user.department}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.batchYear ? (
                              <div className="flex items-center gap-1.5 text-sm text-foreground">
                                <GraduationCap size={13} className="text-muted-foreground" />
                                <span>{user.batchYear}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar size={13} />
                              <span>{formatDate(user.createdAt)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && users.length > 0 && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {users.length} user{users.length !== 1 ? "s" : ""}</span>
              <div className="flex gap-4">
                <span>Admins: {users.filter((u) => u.role === "admin").length}</span>
                <span>Alumni: {users.filter((u) => u.role === "alumni").length}</span>
                <span>Students: {users.filter((u) => u.role === "student").length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsersList;
