import { useEffect } from "react";
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
import { ArrowLeft, MessageSquare, Users } from "lucide-react";

export default function SpaceTopicsPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { spaces } = useAppSelector((state) => state.spaces);
  const { searchQuery, sortBy } = useAppSelector((state) => state.topics);
  const currentSpace = spaces.find((s) => s._id === spaceId);

  // Fetch topics with search query (debounced)
  useEffect(() => {
    if (!spaceId) return;

    const timer = setTimeout(() => {
      dispatch(
        fetchTopicsBySpace({
          spaceId,
          keyword: searchQuery || undefined,
        })
      );
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [dispatch, spaceId, searchQuery]);

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
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Spaces
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {currentSpace?.title || "Space Topics"}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentSpace?.description || "Explore topics in this space"}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate(`/space/${spaceId}/members`)}
              className="flex items-center gap-2"
            >
              <Users size={18} />
              View All Members
            </Button>
          </div>
        </div>

        <div className="p-8">
          <div>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageSquare size={26} className="text-blue-500" />

                  <h2 className="text-3xl font-bold text-gray-900">
                    Topics
                  </h2>
                </div>

                {spaceId && <CreateTopicDialog spaceId={spaceId} />}
              </div>

              {/* Search + Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <Input
                  placeholder="🔍 Search topics..."
                  className="w-72"
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />

                <Select
                  value={sortBy}
                  onValueChange={(value: "latest" | "name") =>
                    dispatch(setSortBy(value))
                  }
                >
                  <SelectTrigger className="w-40">
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

            {/* Footer note */}
            <p className="text-center text-xs text-gray-500 mt-8">
              Join discussions, share insights, and connect with others in this space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
