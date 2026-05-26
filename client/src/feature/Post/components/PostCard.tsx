import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { likePost, deletePost } from "../../../store/Slice/postsSlice";
import type { Post } from "../types/post";
import { useNavigate } from "react-router";

import { Heart, MessageCircle, Calendar, Pencil, Trash2 } from "lucide-react";

import { Button } from "../../core/components/ui/button";
import { Avatar } from "../../core/components/ui/avatar";
import EditPostDialog from "./EditPostDialog";
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

import {
  addComment,
  getComments,
  deleteComment,
  editComment,
  replyToComment,
} from "../api/commentApi";

interface Props {
  post: Post;
}

interface CommentItemProps {
  comment: any;
  likedComments: string[];
  expandedReplies: string[];
  activeReplyId: string | null;
  replyTexts: { [key: string]: string };
  handleLikeComment: (id: string) => void;
  handleDeleteComment: (id: string) => void;
  handleEditComment: (id: string, text: string) => void;
  toggleReplies: (id: string) => void;
  setActiveReplyId: React.Dispatch<React.SetStateAction<string | null>>;
  setReplyTexts: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  submitReply: (id: string) => void;
}

const renderTextWithMentions = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(@\[[^\]]+\])/g);
  return parts.map((part, index) => {
    const isMention = /^@\[[^\]]+\]$/.test(part);
    return isMention ? (
      <span key={index} className="font-medium" style={{ color: "var(--primary)" }}>
        {part.replace(/@|\[|\]/g, "")}
      </span>
    ) : (
      <span key={index}>{part}</span>
    );
  });
};

const CommentItem = React.memo(({
  comment,
  likedComments,
  expandedReplies,
  activeReplyId,
  replyTexts,
  handleLikeComment,
  handleDeleteComment,
  handleEditComment,
  toggleReplies,
  setActiveReplyId,
  setReplyTexts,
  submitReply,
}: CommentItemProps) => {
  return (
    <div className="mt-3">
      <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
        <h4 className="font-semibold text-sm text-foreground">{comment.user?.name}</h4>
        <p className="text-muted-foreground text-sm mt-1.5 break-words leading-relaxed">
          {renderTextWithMentions(comment.text)}
        </p>

        <button
          onClick={() => handleLikeComment(comment._id)}
          className={`flex items-center gap-1.5 text-xs mt-3 transition font-medium ${
            likedComments.includes(comment._id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
          }`}
        >
          <Heart size={12} className={likedComments.includes(comment._id) ? "fill-red-500" : ""} />
          {likedComments.includes(comment._id) ? "Liked" : "Like"}
        </button>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 flex-wrap">
          <button onClick={() => handleDeleteComment(comment._id)} className="hover:text-red-500 font-medium transition-colors">
            Delete
          </button>
          <button
            onClick={() => handleEditComment(comment._id, prompt("Edit comment", comment.text) || "")}
            className="hover:text-foreground font-medium transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            Edit
          </button>
          <button
            onClick={() => {
              setActiveReplyId(activeReplyId === comment._id ? null : comment._id);
              setReplyTexts((prev) => ({
                ...prev,
                [comment._id]: prev[comment._id]?.startsWith(`@${comment.user?.name}`)
                  ? prev[comment._id]
                  : `@[${comment.user?.name || ""}] `,
              }));
            }}
            className="hover:text-foreground font-medium transition-colors"
          >
            Reply
          </button>
          {comment.replies?.length > 0 && (
            <button onClick={() => toggleReplies(comment._id)}
              className="hover:text-foreground font-medium transition-colors"
              style={{ color: "var(--primary)" }}>
              {expandedReplies.includes(comment._id)
                ? "Hide"
                : `${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>

        {activeReplyId === comment._id && (
          <div className="flex gap-2 mt-3">
            <input
              value={replyTexts[comment._id] || ""}
              onChange={(e) => setReplyTexts((prev) => ({ ...prev, [comment._id]: e.target.value }))}
              placeholder={`Reply to ${comment.user?.name}`}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <button
              onClick={() => submitReply(comment._id)}
              className="text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ background: "var(--primary)" }}
            >
              Reply
            </button>
          </div>
        )}
      </div>

      {expandedReplies.includes(comment._id) && comment.replies?.length > 0 && (
        <div className="ml-6 pl-4 mt-3 space-y-3" style={{ borderLeft: "2px solid var(--border)" }}>
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              likedComments={likedComments}
              expandedReplies={expandedReplies}
              activeReplyId={activeReplyId}
              replyTexts={replyTexts}
              handleLikeComment={handleLikeComment}
              handleDeleteComment={handleDeleteComment}
              handleEditComment={handleEditComment}
              toggleReplies={toggleReplies}
              setActiveReplyId={setActiveReplyId}
              setReplyTexts={setReplyTexts}
              submitReply={submitReply}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default function PostCard({ post }: Props) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [isLiking, setIsLiking] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [likedComments, setLikedComments] = useState<string[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await getComments(post._id);
        const data = res?.data ?? res ?? [];
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();
  }, [post._id]);

  const buildCommentTree = (comments: any[]) => {
    const map = new Map<string, any>();
    const roots: any[] = [];
    comments.forEach((c) => map.set(c._id, { ...c, replies: [] }));
    map.forEach((comment) => {
      const parentId = typeof comment.parentComment === "string"
        ? comment.parentComment
        : comment.parentComment?._id;
      if (parentId && map.has(parentId)) {
        map.get(parentId).replies.push(comment);
      } else {
        roots.push(comment);
      }
    });
    return roots;
  };

  const nestedComments = Array.isArray(comments) ? buildCommentTree(comments) : [];

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await dispatch(likePost(post._id)).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deletePost(post._id)).unwrap();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async () => {
    if (!text.trim()) return;
    try {
      const res = await addComment(post._id, text);
      const data = res?.data ?? res;
      setComments((prev) => [data, ...prev]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id && c.parentComment !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (id: string, newText: string) => {
    if (!newText.trim()) return;
    try {
      const res = await editComment(id, newText);
      const data = res?.data ?? res;
      setComments((prev) => prev.map((c) => (c._id === id ? data : c)));
    } catch (err) {
      console.error(err);
    }
  };

  const submitReply = async (parentId: string) => {
    const replyText = replyTexts[parentId];
    if (!replyText?.trim()) return;
    try {
      await replyToComment(parentId, replyText);
      const res = await getComments(post._id);
      const data = res?.data ?? res ?? [];
      setComments(Array.isArray(data) ? data : []);
      setReplyTexts((prev) => ({ ...prev, [parentId]: "" }));
      setActiveReplyId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleLikeComment = (id: string) => {
    setLikedComments((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isLikedByCurrentUser = currentUser?._id ? post.likes?.includes(currentUser._id) : false;
  const isOwner = currentUser?._id === post.author._id;
  const isAdmin = currentUser?.role === "admin";
  const canModify = isOwner || isAdmin;

  return (
    <>
      <div className="rounded-2xl p-6 border transition-all"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <button
            onClick={() => navigate(`/profile/${post.author._id}`)}
            className="shrink-0 rounded-full focus:outline-none"
            aria-label={`View ${post.author.name}'s profile`}
          >
            <Avatar name={post.author.name} avatarUrl={post.author.avatar} size="md" />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground mb-1">{post.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{post.author.name}</span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded-full font-medium capitalize"
                style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                {post.author.role}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>

          {canModify && (
            <div className="flex gap-1.5">
              <button
                onClick={() => setEditDialogOpen(true)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: "var(--secondary)", color: "var(--primary)" }}
                title="Edit post"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
                title="Delete post"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-foreground/80 leading-relaxed text-sm mb-4">{post.content}</div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <Button
            onClick={handleLike}
            disabled={isLiking}
            variant="ghost"
            className="rounded-xl px-4 h-9 gap-2 text-sm font-medium transition-all"
            style={{
              border: `1px solid ${isLikedByCurrentUser ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
              background: isLikedByCurrentUser ? "rgba(239,68,68,0.06)" : "transparent",
              color: isLikedByCurrentUser ? "#EF4444" : "var(--muted-foreground)",
            }}
          >
            <Heart size={14} className={isLikedByCurrentUser ? "fill-red-500 text-red-500" : ""} />
            {post.likes?.length || 0}
          </Button>

          <Button
            onClick={() => setShowComments(!showComments)}
            variant="ghost"
            className="rounded-xl px-4 h-9 gap-2 text-sm font-medium transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
          >
            <MessageCircle size={14} />
            {comments.length}
          </Button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex gap-2 mb-5">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <button
                onClick={handleAddComment}
                className="text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: "var(--primary)" }}
              >
                Post
              </button>
            </div>

            <div className="space-y-4">
              {nestedComments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  likedComments={likedComments}
                  expandedReplies={expandedReplies}
                  activeReplyId={activeReplyId}
                  replyTexts={replyTexts}
                  handleLikeComment={handleLikeComment}
                  handleDeleteComment={handleDeleteComment}
                  handleEditComment={handleEditComment}
                  toggleReplies={toggleReplies}
                  setActiveReplyId={setActiveReplyId}
                  setReplyTexts={setReplyTexts}
                  submitReply={submitReply}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <EditPostDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} post={post} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{post.title}"? This action cannot be undone and will remove all comments on this post.
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
