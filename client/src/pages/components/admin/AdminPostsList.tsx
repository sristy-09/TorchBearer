import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchAllPosts, deletePost } from "../../../store/Slice/postsSlice";
import { fetchSpaces } from "../../../store/Slice/spacesSlice";
import { fetchAllTopics } from "../../../store/Slice/topicsSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Trash2, Heart, Calendar, Search, Loader2, Layers, BookOpen, User, Filter, Menu } from "lucide-react";
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

interface Post {
  _id: string;
  title: string;
  description?: string;
  content: string;
  topic?: {
    _id: string;
    title: string;
  };
  space?: {
    _id: string;
    title: string;
  };
  author?: {
    name: string;
    role: string;
  };
  likes?: any[];
  createdAt: string;
}

function AdminPostsList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { posts, loading } = useAppSelector((state) => state.posts);
  const { spaces } = useAppSelector((state) => state.spaces);
  const { topics } = useAppSelector((state) => state.topics);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  // Fetch spaces and topics for filter dropdowns
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchSpaces({}));
      dispatch(fetchAllTopics({}));
    }
  }, [dispatch, isAuthenticated, user]);

  // Fetch posts with filters
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      const params: { keyword?: string; space?: string; topic?: string } = {};

      if (searchQuery) {
        params.keyword = searchQuery;
      }

      if (selectedSpace && selectedSpace !== "all") {
        params.space = selectedSpace;
      }

      if (selectedTopic && selectedTopic !== "all") {
        params.topic = selectedTopic;
      }

      dispatch(fetchAllPosts(params));
    }
  }, [dispatch, isAuthenticated, user, searchQuery, selectedSpace, selectedTopic]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSpaceFilter = (value: string) => {
    setSelectedSpace(value);
    // Reset topic filter when space changes
    if (value === "all") {
      setSelectedTopic("all");
    }
  };

  const handleTopicFilter = (value: string) => {
    setSelectedTopic(value);
  };

  const handleDeleteClick = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deletePost(postToDelete)).unwrap();
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = (post: Post) => {
    // Only navigate if post has space and topic
    if (post.space && post.topic) {
      navigate(`/space/${post.space._id}/topic/${post.topic._id}/posts#post-${post._id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 lg:ml-64 p-8">
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

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Posts List</h1>
            <p className="text-muted-foreground mt-1 text-sm">View and manage all posts across all topics</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>

            {/* Space Filter */}
            <div className="w-56">
              <Select value={selectedSpace} onValueChange={handleSpaceFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-gray-400" />
                    <SelectValue placeholder="Filter by space" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Spaces</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space._id} value={space._id}>
                      {space.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic Filter */}
            <div className="w-56">
              <Select value={selectedTopic} onValueChange={handleTopicFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-400" />
                    <SelectValue placeholder="Filter by topic" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics
                    .filter((topic) =>
                      selectedSpace === "all" || topic.space?._id === selectedSpace
                    )
                    .map((topic) => (
                      <SelectItem key={topic._id} value={topic._id}>
                        {topic.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="animate-spin w-7 h-7" style={{ color: "var(--primary)" }} />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">
                  {searchQuery || selectedSpace !== "all" || selectedTopic !== "all"
                    ? "No posts found matching your filters."
                    : "No posts available yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                    <tr>
                      {["Post", "Topic", "Space", "Author", "Likes", "Created", "Actions"].map((h, i) => (
                        <th key={h} className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${i === 6 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr
                        key={post._id}
                        onClick={() => handleRowClick(post)}
                        className="transition-colors"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--background)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground line-clamp-1">{post.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          {post.topic ? (
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <BookOpen size={13} className="text-muted-foreground" />
                              <span className="line-clamp-1">{post.topic.title}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Topic deleted</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {post.space ? (
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <Layers size={13} className="text-muted-foreground" />
                              <span className="line-clamp-1">{post.space.title}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Space deleted</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-muted-foreground" />
                            <div>
                              <div className="text-sm text-foreground">{post.author?.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground capitalize">{post.author?.role || "N/A"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Heart size={13} className="text-red-400" />
                            <span>{post.likes?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar size={13} />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => handleDeleteClick(post._id, e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            style={{ background: "rgba(239,68,68,0.08)" }}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && posts.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Showing {posts.length} post{posts.length !== 1 ? "s" : ""}
              {(selectedSpace !== "all" || selectedTopic !== "all") && (
                <span className="ml-2">
                  {selectedSpace !== "all" && (
                    <span>in {spaces.find(s => s._id === selectedSpace)?.title || "selected space"}</span>
                  )}
                  {selectedSpace !== "all" && selectedTopic !== "all" && <span> / </span>}
                  {selectedTopic !== "all" && (
                    <span>{topics.find(t => t._id === selectedTopic)?.title || "selected topic"}</span>
                  )}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone. All comments on this post will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <><Loader2 className="animate-spin mr-2" size={14} />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminPostsList;
