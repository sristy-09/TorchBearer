import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
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
import { ArrowLeft } from "lucide-react";

export default function TopicPostsPage() {
  const { spaceId, topicId } = useParams<{ spaceId: string; topicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { topics } = useAppSelector((state) => state.topics);
  const { searchQuery, sortBy, posts } = useAppSelector((state) => state.posts);
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

  // Scroll to specific post if hash is present
  useEffect(() => {
    const hash = location.hash;
    if (hash && posts.length > 0) {
      // Wait for posts to load and render
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a highlight effect
          element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
          }, 2000);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.hash, posts]);

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />

      <div className="flex-1 ml-64 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/space/${spaceId}/topics`)}
              className="flex items-center gap-2 mb-4 -ml-2"
            >
              <ArrowLeft size={16} />
              Back to Topics
            </Button>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
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

        <div className="max-w-4xl mx-auto px-8 py-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Discussion
              </h2>
              {topicId && <CreatePostDialog topicId={topicId} />}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-6">
              <Input
                placeholder="Search posts..."
                className="w-80"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />

              <Select
                value={sortBy}
                onValueChange={(value: "latest" | "popular") =>
                  dispatch(setSortBy(value))
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <PostsList />
          </div>
        </div>
      </div>
    </div>
  );
}
