import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { deleteTopic } from "../../../store/Slice/topicsSlice";
import type { Topic } from "../types/topic";
import { Pencil, Trash2, MessageSquare } from "lucide-react";
import EditTopicDialog from "./EditTopicDialog";
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
  topic: Topic;
}

export default function TopicCard({ topic }: Props) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUser?._id === topic.createdBy?._id;
  const isAdmin = currentUser?.role === "admin";
  const canModify = isOwner || isAdmin;

  const handleClick = () => {
    navigate(`/space/${topic.space?._id}/topic/${topic._id}/posts`);
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
      await dispatch(deleteTopic(topic._id)).unwrap();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete topic:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="group rounded-2xl p-5 border card-hover transition-all cursor-pointer relative"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {canModify && (
          <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "var(--secondary)", color: "var(--primary)" }}
              title="Edit topic"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
              title="Delete topic"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
          style={{ background: "var(--secondary)" }}>
          <MessageSquare size={16} style={{ color: "var(--primary)" }} />
        </div>

        <h2 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors pr-16 leading-snug">
          {topic.title}
        </h2>

        <p className="text-muted-foreground mt-1.5 text-xs line-clamp-2 leading-relaxed">
          {topic.description}
        </p>

        <div className="mt-4 pt-3 flex items-center justify-between text-xs"
          style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-muted-foreground">by {topic.createdBy?.name}</span>
          {topic.posts && topic.posts.length > 0 && (
            <span className="font-medium px-2 py-0.5 rounded-full"
              style={{ background: "var(--secondary)", color: "var(--primary)" }}>
              {topic.posts.length} {topic.posts.length === 1 ? "post" : "posts"}
            </span>
          )}
        </div>
      </div>

      <EditTopicDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} topic={topic} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{topic.title}"? This action cannot be undone and will remove all posts within this topic.
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
