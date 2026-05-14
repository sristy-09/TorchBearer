import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { deleteSpace } from "../../../store/Slice/spacesSlice";
import type { Space } from "../types/space";
import { Pencil, Trash2 } from "lucide-react";
import EditSpaceDialog from "./EditSpaceDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../core/components/ui/alert-dialog";

interface Props {
  space: Space;
}

export default function SpaceCard({ space }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUser?._id === space.createdBy?._id;
  const isAdmin = currentUser?.role === "admin";
  const canModify = isOwner || isAdmin;

  const handleClick = () => {
    navigate(`/space/${space._id}/topics`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteSpace(space._id)).unwrap();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete space:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="group border border-gray-200 rounded-lg p-6 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer relative"
      >
        {canModify && (
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
              title="Edit space"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
              title="Delete space"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        <h2 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors pr-20">
          {space.title}
        </h2>

        <p className="text-gray-600 mt-2 text-sm line-clamp-2 leading-relaxed">
          {space.description}
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          Created by {space.createdBy?.name}
        </div>
      </div>

      <EditSpaceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        space={space}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{space.title}"? This action cannot be undone and will remove all topics and posts within this space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}