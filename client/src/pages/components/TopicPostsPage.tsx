import { useEffect, useState } from "react";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { topics } = useAppSelector((state) => state.topics);
  const { searchQuery, sortBy, posts } = useAppSelector((state) => state.posts);
  const currentTopic = topics.find((t) => t._id === topicId);

  useEffect(() => {
    if (!topicId) return;
    const timer = setTimeout(() => {
      dispatch(fetchPostsByTopic({ topicId, keyword: searchQuery || undefined }));
    }, 500);
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
    <div className="flex h-screen" style={{ background: "var(--background)" }}>
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 overflow-auto">
        {/* Header */}
        <div className="px-8 pt-7 pb-5" style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}>
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/space/${spaceId}/topics`)}
              className="flex items-center gap-2 mb-4 -ml-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <ArrowLeft size={15} />
              Back to Topics
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {currentTopic?.title || "Topic Posts"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {currentTopic?.description || "This is the topic description"}
              </p>
              {currentTopic?.space && (
                <p className="text-xs text-muted-foreground mt-1">
                  in {currentTopic.space.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Discussion</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Share your thoughts and ideas</p>
              </div>
              {topicId && <CreatePostDialog topicId={topicId} />}
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Input
                placeholder="Search posts..."
                className="w-72 rounded-xl"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />
              <Select
                value={sortBy}
                onValueChange={(value: "latest" | "popular") => dispatch(setSortBy(value))}
              >
                <SelectTrigger className="w-36 rounded-xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Posts List */}
          <PostsList />
        </div>
      </div>
    </div>
  );
}
