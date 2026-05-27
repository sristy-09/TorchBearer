import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchSpaces } from "../../../store/Slice/spacesSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Search, Loader2, Users, Trash2, Layers, AlertCircle, CheckCircle, Menu } from "lucide-react";
import { Avatar } from "../../../feature/core/components/ui/avatar";
import { apiClient } from "../../../store/Slice/authSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../feature/core/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../feature/core/components/ui/select";

interface SpaceMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department?: string;
  batchYear?: number;
}

function AdminUserManagement() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: currentUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const { spaces } = useAppSelector((state) => state.spaces);

  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<SpaceMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<SpaceMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [actionStatus, setActionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Fetch spaces on mount
  useEffect(() => {
    if (isAuthenticated && currentUser?.role === "admin") {
      dispatch(fetchSpaces({}));
    }
  }, [dispatch, isAuthenticated, currentUser]);

  // Fetch members when space is selected
  useEffect(() => {
    if (selectedSpace) {
      loadSpaceMembers(selectedSpace);
    } else {
      setMembers([]);
      setFilteredMembers([]);
    }
  }, [selectedSpace]);

  // Filter members based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = members.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchQuery, members]);

  const loadSpaceMembers = async (spaceId: string) => {
    setLoading(true);
    setActionStatus({ type: null, message: "" });
    try {
      const response = await apiClient.get(`/api/spaces/${spaceId}/members`);
      setMembers(response.data.data || []);
      setFilteredMembers(response.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch space members:", error);
      setActionStatus({
        type: "error",
        message: "Failed to load space members. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (member: SpaceMember) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove || !selectedSpace) return;

    setIsRemoving(true);
    setActionStatus({ type: null, message: "" });

    try {
      await apiClient.delete(`/api/spaces/${selectedSpace}/members`, {
        data: { userId: memberToRemove._id },
      });

      // Update local state
      setMembers((prev) => prev.filter((m) => m._id !== memberToRemove._id));
      setFilteredMembers((prev) => prev.filter((m) => m._id !== memberToRemove._id));

      setActionStatus({
        type: "success",
        message: `${memberToRemove.name} has been removed from the space.`,
      });

      setRemoveDialogOpen(false);
      setMemberToRemove(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionStatus({ type: null, message: "" });
      }, 3000);
    } catch (error: any) {
      console.error("Failed to remove member:", error);
      setActionStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to remove member. Please try again.",
      });
      setRemoveDialogOpen(false);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSpaceChange = (value: string) => {
    setSelectedSpace(value);
    setSearchQuery("");
    setActionStatus({ type: null, message: "" });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (!isAuthenticated || currentUser?.role !== "admin") {
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

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage space members and remove users from spaces
            </p>
          </div>

          {/* Success Message */}
          {actionStatus.type === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700 mt-1">{actionStatus.message}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {actionStatus.type === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{actionStatus.message}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Space Selector */}
            <div className="relative">
              <Select value={selectedSpace} onValueChange={handleSpaceChange}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-gray-400" />
                    <SelectValue placeholder="Select a space" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {spaces.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-gray-500">
                      No spaces available
                    </div>
                  ) : (
                    spaces.map((space) => (
                      <SelectItem key={space._id} value={space._id}>
                        {space.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchQuery}
                onChange={handleSearch}
                disabled={!selectedSpace}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {!selectedSpace ? (
              <div className="text-center py-12">
                <Layers className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">
                  Please select a space to view its members
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">
                  {searchQuery
                    ? "No members found matching your search."
                    : members.length === 0
                      ? "This space has no members yet."
                      : "No members found."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.name} avatarUrl={member.avatar} size="md" />
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {member.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {member.department ? (
                            <div className="text-sm text-gray-900">{member.department}</div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {member.batchYear ? (
                            <div className="text-sm text-gray-900">{member.batchYear}</div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemoveClick(member)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats */}
          {selectedSpace && !loading && filteredMembers.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
              {members.length !== filteredMembers.length && ` of ${members.length} total`}
            </div>
          )}
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member from Space</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>
                  Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from this space?
                </p>
                <p className="mt-2">This action will:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Remove their access to this space</li>
                  <li>Remove them from all topics in this space</li>
                  <li>They can request to join again later</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveConfirm}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminUserManagement;
