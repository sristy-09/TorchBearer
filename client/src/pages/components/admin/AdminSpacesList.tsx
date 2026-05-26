import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchSpaces, deleteSpace } from "../../../store/Slice/spacesSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Trash2, Users, Calendar, Search, Loader2 } from "lucide-react";
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

function AdminSpacesList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { spaces, loading } = useAppSelector((state) => state.spaces);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchSpaces({ keyword: searchQuery }));
    }
  }, [dispatch, isAuthenticated, user, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!spaceToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteSpace(spaceToDelete)).unwrap();
      setDeleteDialogOpen(false);
      setSpaceToDelete(null);
    } catch (error) {
      console.error("Failed to delete space:", error);
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Spaces List</h1>
            <p className="text-muted-foreground mt-1 text-sm">View and manage all spaces in the platform</p>
          </div>

          {/* Search */}
          <div className="mb-5">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search spaces by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            {loading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="animate-spin w-7 h-7" style={{ color: "var(--primary)" }} />
              </div>
            ) : spaces.length === 0 ? (
              <div className="text-center py-14 text-muted-foreground text-sm">
                {searchQuery ? "No spaces found matching your search." : "No spaces available yet."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                    <tr>
                      {["Space", "Created By", "Members", "Created", "Actions"].map((h, i) => (
                        <th key={h} className={`px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${i === 4 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {spaces.map((space) => (
                      <tr key={space._id} className="transition-colors"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--background)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground">{space.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{space.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">{space.createdBy.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{space.createdBy.role}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users size={14} />
                            <span>{space.members?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar size={14} />
                            <span>{formatDate(space.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => { setSpaceToDelete(space._id); setDeleteDialogOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-red-500 hover:text-red-600"
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

          {!loading && spaces.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Showing {spaces.length} space{spaces.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this space? This action cannot be undone. All topics, posts, and comments within this space will also be deleted.
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

export default AdminSpacesList;
