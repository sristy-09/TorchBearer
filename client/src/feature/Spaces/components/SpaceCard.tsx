import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { deleteSpace } from "../../../store/Slice/spacesSlice";
import type { Space } from "../types/space";
import { Pencil, Trash2, Users } from "lucide-react";
import EditSpaceDialog from "./EditSpaceDialog";
import RequestJoinButton from "./RequestJoinButton";
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
  const isMember = space.members?.includes(currentUser?._id || "");
  const canAccess = isMember || isAdmin;

  const handleClick = () => {
    if (canAccess) navigate(`/space/${space._id}/topics`);
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
        className={`group rounded-2xl p-5 border card-hover transition-all relative ${canAccess ? "cursor-pointer" : ""}`}
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Modify actions */}
        {canModify && (
          <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "var(--secondary)", color: "var(--primary)" }}
              title="Edit space"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
              title="Delete space"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        <h2 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors pr-16 leading-snug">
          {space.title}
        </h2>

        <p className="text-muted-foreground mt-1.5 text-xs line-clamp-2 leading-relaxed">
          {space.description}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users size={13} />
            <span>{space.members?.length || 0} members</span>
          </div>
          {canAccess && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: "var(--secondary)", color: "var(--primary)" }}>
              Member
            </span>
          )}
        </div>

        {/* Join button */}
        {!canAccess && (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <RequestJoinButton spaceId={space._id} isMember={!!isMember} />
          </div>
        )}
      </div>

      <EditSpaceDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} space={space} />

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
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
