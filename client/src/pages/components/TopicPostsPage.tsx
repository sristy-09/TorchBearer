import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Sidebar from "../../feature/core/components/Sidebar";
import { Button } from "../../feature/core/components/ui/button";
import { Input } from "../../feature/core/components/ui/input";
import CreatePostDialog from "../../feature/Post/components/CreatePostDialog";
import PostsList from "../../feature/Post/components/PostsList";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPostsByTopic, setSearchQuery, setSortBy } from "../../store/Slice/postsSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../feature/core/components/ui/select";
import { ArrowLeft, FileText } from "lucide-react";

export default function TopicPostsPage() {
  const { spaceId, topicId } = useParams<{ spaceId: string; topicId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { topics } = useAppSelector((state) => state.topics);
  const { searchQuery, sortBy } = useAppSelector((state) => state.posts);
  const currentTopic = topics.find((t) => t._id === topicId);

  // Fetch posts with search query (debounced)
  useEffect(() => {
    if (!topicId) return;

    const timer = setTimeout(() => {
      dispatch(
        fetchPostsByTopic({
          topicId,
          keyword: searchQuery || undefined,
        })
      );
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [dispatch, topicId, searchQuery]);

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
              <h1 className="text-2xl font-bold text-gray-800">
                {currentTopic?.title || "Topic Posts"}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentTopic?.description || "Explore posts in this topic"}
              </p>
              {currentTopic?.space && (
                <p className="text-sm text-gray-500 mt-1">
                  in {currentTopic.space.title}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 max-w-4xl mx-auto">
          <div>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText size={26} className="text-blue-500" />

                  <h2 className="text-3xl font-bold text-gray-900">
                    Posts
                  </h2>
                </div>

                {topicId && <CreatePostDialog topicId={topicId} />}
              </div>

              {/* Search + Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <Input
                  placeholder="🔍 Search posts..."
                  className="w-72"
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />

                <Select
                  value={sortBy}
                  onValueChange={(value: "latest" | "popular") =>
                    dispatch(setSortBy(value))
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Posts List (Linear format) */}
            <PostsList />

            {/* Footer note */}
            <p className="text-center text-xs text-gray-500 mt-8">
              Share your knowledge, ask questions, and engage with the community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
