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
import { ArrowLeft, Users } from "lucide-react";

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
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 mb-4 -ml-2"
            >
              <ArrowLeft size={16} />
              Back to Spaces
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">
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
                Members
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Topics
              </h2>
              {spaceId && <CreateTopicDialog spaceId={spaceId} />}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-6">
              <Input
                placeholder="Search topics..."
                className="w-80"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />

              <Select
                value={sortBy}
                onValueChange={(value: "latest" | "name") =>
                  dispatch(setSortBy(value))
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TopicsGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
