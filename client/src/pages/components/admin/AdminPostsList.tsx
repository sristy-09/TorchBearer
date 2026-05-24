import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchAllPosts, deletePost } from "../../../store/Slice/postsSlice";
import { fetchSpaces } from "../../../store/Slice/spacesSlice";
import { fetchAllTopics } from "../../../store/Slice/topicsSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Trash2, Heart, Calendar, Search, Loader2, Layers, BookOpen, User, Filter } from "lucide-react";
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

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/admin/login");
    }
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

  const handleDeleteClick = (postId: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Posts List</h1>
            <p className="text-gray-600 mt-2">
              View and manage all posts across all topics
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search posts by title..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Posts Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery || selectedSpace !== "all" || selectedTopic !== "all"
                    ? "No posts found matching your filters."
                    : "No posts available yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Post
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Space
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Likes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {post.title}
                            </div>
                            {post.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {post.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {post.topic ? (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <BookOpen size={16} className="text-gray-400" />
                              <span className="line-clamp-1">{post.topic.title}</span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">
                              Topic deleted
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {post.space ? (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Layers size={16} className="text-gray-400" />
                              <span className="line-clamp-1">{post.space.title}</span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">
                              Space deleted
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {post.author?.name || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {post.author?.role || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Heart size={16} className="text-red-400" />
                            <span>{post.likes?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteClick(post._id)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
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

          {/* Stats */}
          {!loading && posts.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
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
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
              All comments on this post will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminPostsList;
