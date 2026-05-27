import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../../feature/core/components/Sidebar";
import { Button } from "../../feature/core/components/ui/button";
import { Input } from "../../feature/core/components/ui/input";
import CreateTopicDialog from "../../feature/Topic/components/CreateTopicDialog";
import TopicsGrid from "../../feature/Topic/components/TopicsGrid";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTopicsBySpace, setSearchQuery, setSortBy } from "../../store/Slice/topicsSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../feature/core/components/ui/select";
import { ArrowLeft, Users, Menu } from "lucide-react";

export default function SpaceTopicsPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { spaces } = useAppSelector((state) => state.spaces);
  const { searchQuery, sortBy } = useAppSelector((state) => state.topics);
  const currentSpace = spaces.find((s) => s._id === spaceId);

  useEffect(() => {
    if (!spaceId) return;
    const timer = setTimeout(() => {
      dispatch(fetchTopicsBySpace({ spaceId, keyword: searchQuery || undefined }));
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, spaceId, searchQuery]);

  return (
    <div className="flex h-screen" style={{ background: "var(--background)" }}>
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 overflow-auto">
        {/* Header */}
        <div className="px-8 pt-7 pb-5" style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
          <div className="max-w-7xl mx-auto">
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden mb-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} className="text-foreground" />
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <ArrowLeft size={15} />
              Back to Spaces
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {currentSpace?.title || "Space Topics"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {currentSpace?.description || "This space is for discussions"}
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate(`/space/${spaceId}/members`)}
                className="flex items-center gap-2 rounded-xl"
                style={{ borderColor: "var(--border)", background: "var(--background)" }}
              >
                <Users size={16} />
                Members
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Topics</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Browse and join discussions</p>
              </div>
              {spaceId && <CreateTopicDialog spaceId={spaceId} />}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Input
                placeholder="Search topics..."
                className="w-72 rounded-xl"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />
              <Select
                value={sortBy}
                onValueChange={(value: "latest" | "name") => dispatch(setSortBy(value))}
              >
                <SelectTrigger className="w-36 rounded-xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topics Grid */}
          <TopicsGrid />
        </div>
      </div>
    </div>
  );
}
