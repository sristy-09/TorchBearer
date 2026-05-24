import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { fetchAllTopics, deleteTopic, updateTopic } from "../../../store/Slice/topicsSlice";
import { fetchSpaces } from "../../../store/Slice/spacesSlice";
import AdminSidebar from "../../../feature/core/components/AdminSidebar";
import { Trash2, MessageSquare, Calendar, Search, Loader2, Layers, Edit, Filter } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../feature/core/components/ui/select";
import { Button } from "../../../feature/core/components/ui/button";
import { Input } from "../../../feature/core/components/ui/input";
import { Textarea } from "../../../feature/core/components/ui/textarea";
import { Label } from "../../../feature/core/components/ui/label";

interface Topic {
  _id: string;
  title: string;
  description: string;
  space?: {
    _id: string;
    title: string;
  };
  createdBy?: {
    name: string;
    role: string;
  };
  posts?: any[];
  createdAt: string;
}

function AdminTopicsList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { topics, loading } = useAppSelector((state) => state.topics);
  const { spaces } = useAppSelector((state) => state.spaces);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch spaces for filter dropdown
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      dispatch(fetchSpaces({}));
    }
  }, [dispatch, isAuthenticated, user]);

  // Fetch topics with filters
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      const params: { keyword?: string; space?: string } = {};

      if (searchQuery) {
        params.keyword = searchQuery;
      }

      if (selectedSpace && selectedSpace !== "all") {
        params.space = selectedSpace;
      }

      dispatch(fetchAllTopics(params));
    }
  }, [dispatch, isAuthenticated, user, searchQuery, selectedSpace]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSpaceFilter = (value: string) => {
    setSelectedSpace(value);
  };

  const handleDeleteClick = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setTopicToDelete(topicId);
    setDeleteDialogOpen(true);
  };

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

  const handleEditClick = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setTopicToEdit(topic);
    setEditForm({
      title: topic.title,
      description: topic.description,
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
    if (!topicToEdit) return;

    setIsUpdating(true);
    try {
      await dispatch(
        updateTopic({
          id: topicToEdit._id,
          data: {
            title: editForm.title,
            description: editForm.description,
          },
        })
      ).unwrap();

      setEditDialogOpen(false);
      setTopicToEdit(null);
    } catch (error) {
      console.error("Failed to update topic:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRowClick = (topic: Topic) => {
    // Only navigate if topic has a space
    if (topic.space) {
      navigate(`/space/${topic.space._id}/topic/${topic._id}/posts`);
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
            <h1 className="text-3xl font-bold text-gray-900">Topics List</h1>
            <p className="text-gray-600 mt-2">
              View and manage all topics across all spaces
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search topics by title..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Space Filter */}
            <div className="w-64">
              <Select value={selectedSpace} onValueChange={handleSpaceFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
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
          </div>

          {/* Topics Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchQuery || selectedSpace !== "all"
                    ? "No topics found matching your filters."
                    : "No topics available yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Space
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posts
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
                    {topics.map((topic) => (
                      <tr
                        key={topic._id}
                        onClick={() => handleRowClick(topic)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {topic.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {topic.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {topic.space ? (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Layers size={16} className="text-gray-400" />
                              {topic.space.title}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">
                              Space deleted
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {topic.createdBy?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {topic.createdBy?.role || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MessageSquare size={16} />
                            <span>{topic.posts?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>{formatDate(topic.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleEditClick(topic, e)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(topic._id, e)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
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

          {/* Stats */}
          {!loading && topics.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {topics.length} topic{topics.length !== 1 ? "s" : ""}
              {selectedSpace !== "all" && (
                <span className="ml-2">
                  in {spaces.find(s => s._id === selectedSpace)?.title || "selected space"}
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
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this topic? This action cannot be undone.
              All posts and comments within this topic will also be deleted.
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

      {/* Edit Topic Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
            <DialogDescription>
              Update the topic details below. Click save when you're done.
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
                placeholder="Enter topic title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editForm.description}
                onChange={handleEditFormChange}
                placeholder="Enter topic description"
                rows={4}
              />
            </div>
            {topicToEdit?.space && (
              <div className="grid gap-2">
                <Label>Space</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                  <Layers size={16} className="text-gray-400" />
                  {topicToEdit.space.title}
                </div>
                <p className="text-xs text-gray-500">
                  Space cannot be changed after topic creation
                </p>
              </div>
            )}
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

export default AdminTopicsList;
