import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchSpaces, deleteSpace, updateSpace } from "../../../store/Slice/spacesSlice";
import type { Space } from "../../../feature/Spaces/types/space";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Trash2, Users, Calendar, Search, Loader2, Edit, MessageSquare, Menu } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../feature/core/components/ui/dialog";
import { Button } from "../../../feature/core/components/ui/button";
import { Input } from "../../../feature/core/components/ui/input";
import { Textarea } from "../../../feature/core/components/ui/textarea";
import { Label } from "../../../feature/core/components/ui/label";

function AdminSpacesList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { spaces, loading } = useAppSelector((state) => state.spaces);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [spaceToEdit, setSpaceToEdit] = useState<Space | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    tags: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") navigate("/admin/login");
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchSpaces({ keyword: searchQuery }));
    }
  }, [dispatch, isAuthenticated, user, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteClick = (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setSpaceToDelete(spaceId);
    setDeleteDialogOpen(true);
  };

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

  const handleEditClick = (space: Space, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setSpaceToEdit(space);
    setEditForm({
      title: space.title,
      description: space.description,
      tags: space.tags?.join(", ") || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditConfirm = async () => {
    if (!spaceToEdit) return;

    setIsUpdating(true);
    try {
      const tagsArray = editForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await dispatch(
        updateSpace({
          id: spaceToEdit._id,
          data: {
            title: editForm.title,
            description: editForm.description,
            tags: tagsArray,
          },
        })
      ).unwrap();

      setEditDialogOpen(false);
      setSpaceToEdit(null);
    } catch (error) {
      console.error("Failed to update space:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRowClick = (spaceId: string) => {
    navigate(`/space/${spaceId}/topics`);
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
                      <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider text-muted-foreground">
                        Space
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-muted-foreground">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-muted-foreground">
                        Topics
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-muted-foreground">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-muted-foreground">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {spaces.map((space) => (
                      <tr
                        key={space._id}
                        onClick={() => handleRowClick(space._id)}
                        className="transition-colors cursor-pointer"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--background)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground">{space.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{space.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-foreground">{space.createdBy.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{space.createdBy.role}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MessageSquare size={16} />
                            <span>{space.topicsCount || 0}</span>
                          </div>
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleEditClick(space, e)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(space._id, e)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              style={{ background: "rgba(239,68,68,0.08)" }}
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
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

      {/* Edit Space Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-131.25">
          <DialogHeader>
            <DialogTitle>Edit Space</DialogTitle>
            <DialogDescription>
              Update the space details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={editForm.title}
                onChange={handleEditFormChange}
                placeholder="Enter space title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editForm.description}
                onChange={handleEditFormChange}
                placeholder="Enter space description"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={editForm.tags}
                onChange={handleEditFormChange}
                placeholder="e.g., technology, programming, web"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleEditConfirm}
              disabled={isUpdating || !editForm.title || !editForm.description}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminSpacesList;
