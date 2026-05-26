import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchAllTopics, deleteTopic } from "../../../store/Slice/topicsSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Trash2, MessageSquare, Calendar, Search, Loader2, Layers } from "lucide-react";
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

function AdminTopicsList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { topics, loading } = useAppSelector((state) => state.topics);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchAllTopics({ keyword: searchQuery }));
    }
  }, [dispatch, isAuthenticated, user, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!topicToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTopic(topicToDelete)).unwrap();
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    } catch (error) {
      console.error("Failed to delete topic:", error);
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Topics List</h1>
            <p className="text-muted-foreground mt-1 text-sm">View and manage all topics across all spaces</p>
          </div>

          <div className="mb-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search topics by title..."
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
            ) : topics.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground text-sm">
                {searchQuery ? "No topics found matching your search." : "No topics available yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                    <tr>
                      {["Topic", "Space", "Created By", "Posts", "Created", "Actions"].map((h, i) => (
                        <th key={h} className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${i === 5 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((topic) => (
                      <tr key={topic._id} className="transition-colors"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--background)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground">{topic.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{topic.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          {topic.space ? (
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <Layers size={13} className="text-muted-foreground" />
                              {topic.space.title}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Space deleted</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">{topic.createdBy?.name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground capitalize">{topic.createdBy?.role || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MessageSquare size={13} />
                            <span>{topic.posts?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar size={13} />
                            <span>{formatDate(topic.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => { setTopicToDelete(topic._id); setDeleteDialogOpen(true); }}
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

          {!loading && topics.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Showing {topics.length} topic{topics.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this topic? This action cannot be undone. All posts and comments within this topic will also be deleted.
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

export default AdminTopicsList;
