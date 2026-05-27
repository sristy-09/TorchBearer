import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../../feature/core/components/Sidebar";
import { Button } from "../../feature/core/components/ui/button";
import { Avatar } from "../../feature/core/components/ui/avatar";
import { Input } from "../../feature/core/components/ui/input";
import { ArrowLeft, Users, Loader2, Search, Menu } from "lucide-react";
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

const roleBadgeStyle: Record<string, { bg: string; color: string }> = {
  admin: { bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
  alumni: { bg: "var(--secondary)", color: "var(--primary)" },
  student: { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
};

export default function SpaceMembersPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { spaces } = useAppSelector((state) => state.spaces);
  const currentSpace = spaces.find((s) => s._id === spaceId);

  useEffect(() => {
    if (spaceId) fetchMembers();
  }, [spaceId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(
        members.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query) ||
            m.department?.toLowerCase().includes(query)
        )
      );
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

  return (
    <div className="flex h-screen" style={{ background: "var(--background)" }}>
      <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 overflow-auto">
        {/* Header */}
        <div className="px-8 pt-7 pb-5" style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/space/${spaceId}/topics`)}
              className="flex items-center gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <ArrowLeft size={16} />
              Back to Topics
            </Button>

            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 truncate">
                  <Users className="w-6 h-6 flex-shrink-0" style={{ color: "var(--primary)" }} />
                  <span className="truncate">Members of {currentSpace?.title || "Space"}</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {members.length} member{members.length !== 1 ? "s" : ""} in this space
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search members..."
                className="pl-10 rounded-xl"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-sm">{error}</p>
              <Button onClick={fetchMembers} className="mt-4 rounded-xl" variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base">
                {searchQuery ? "No members found matching your search" : "No members in this space yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => {
                const badge = roleBadgeStyle[member.role] || { bg: "var(--muted)", color: "var(--muted-foreground)" };
                return (
                  <div
                    key={member._id}
                    className="rounded-2xl border p-5 card-hover transition-all"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <Avatar name={member.name} avatarUrl={member.avatar} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                        <span
                          className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="truncate">{member.email}</p>
                      {member.department && (
                        <p><span className="font-medium text-foreground/70">Dept:</span> {member.department}</p>
                      )}
                      {member.batchYear && (
                        <p><span className="font-medium text-foreground/70">Batch:</span> {member.batchYear}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
