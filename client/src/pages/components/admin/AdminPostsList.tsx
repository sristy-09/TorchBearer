import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchAllPosts, deletePost } from "../../../store/Slice/postsSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Trash2, Heart, Calendar, Search, Loader2, Layers, BookOpen, User } from "lucide-react";
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

function AdminPostsList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { posts, loading } = useAppSelector((state) => state.posts);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchAllPosts({ keyword: searchQuery }));
    }
  }, [dispatch, isAuthenticated, user, searchQuery]);

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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (!isAuthenticated || user?.role !== "admin") return null;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Posts List</h1>
            <p className="text-muted-foreground mt-1 text-sm">View and manage all posts across all topics</p>
          </div>

          <div className="mb-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="animate-spin w-7 h-7" style={{ color: "var(--primary)" }} />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground text-sm">
                {searchQuery ? "No posts found matching your search." : "No posts available yet."}
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
                      <tr key={post._id} className="transition-colors"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--background)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
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
                            onClick={() => { setPostToDelete(post._id); setDeleteDialogOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-red-500"
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
