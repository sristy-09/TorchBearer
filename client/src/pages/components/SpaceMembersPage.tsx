import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../../feature/core/components/Sidebar";
import { Button } from "../../feature/core/components/ui/button";
import { Avatar } from "../../feature/core/components/ui/avatar";
import { Badge } from "../../feature/core/components/ui/badge";
import { Input } from "../../feature/core/components/ui/input";
import { ArrowLeft, Users, Loader2, Search } from "lucide-react";
import { apiClient } from "../../store/Slice/authSlice";
import { useAppSelector } from "../../store/hooks";

interface Member {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department?: string;
  batchYear?: number;
}

export default function SpaceMembersPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { spaces } = useAppSelector((state) => state.spaces);
  const currentSpace = spaces.find((s) => s._id === spaceId);

  useEffect(() => {
    if (spaceId) {
      fetchMembers();
    }
  }, [spaceId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.department?.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/spaces/${spaceId}/members`);
      setMembers(response.data.data);
      setFilteredMembers(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "alumni":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gray-100 border-b px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/space/${spaceId}/topics`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Topics
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Members of {currentSpace?.title || "Space"}
              </h1>
              <p className="text-gray-600 mt-1">
                {members.length} member{members.length !== 1 ? "s" : ""} in this space
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search members by name, email, or department..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Members List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">{error}</p>
              <Button
                onClick={fetchMembers}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery
                  ? "No members found matching your search"
                  : "No members in this space yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex flex-col p-5 rounded-lg border bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <Avatar
                      name={member.name}
                      avatarUrl={member.avatar}
                      size="lg"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-lg">
                        {member.name}
                      </h3>
                      <Badge className={`${getRoleBadgeColor(member.role)} mt-1`}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600 truncate">{member.email}</p>
                    {member.department && (
                      <p className="text-gray-500">
                        <span className="font-medium">Department:</span> {member.department}
                      </p>
                    )}
                    {member.batchYear && (
                      <p className="text-gray-500">
                        <span className="font-medium">Batch:</span> {member.batchYear}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
