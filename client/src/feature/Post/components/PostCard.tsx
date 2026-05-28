import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { likePost, deletePost } from "../../../store/Slice/postsSlice";
import type { Post } from "../types/post";
import { useNavigate } from "react-router";
import { apiClient } from "../../../store/Slice/authSlice";

import { Heart, MessageCircle, Calendar, Pencil, Trash2, Download, FileIcon, ImageIcon, VideoIcon, FileTextIcon, ChevronLeft, ChevronRight, Lock } from "lucide-react";

import { Button } from "../../core/components/ui/button";
import { Avatar } from "../../core/components/ui/avatar";
import EditPostDialog from "./EditPostDialog";
import EditCommentDialog from "./EditCommentDialog";
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

import { linkifyText } from "../utils/linkify";

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
  openEditDialog: (id: string, text: string) => void;
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
  openEditDialog,
  toggleReplies,
  setActiveReplyId,
  setReplyTexts,
  submitReply,
}: CommentItemProps) => {
  return (
    <div className="mt-3">
      <div className="rounded-xl p-4" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
        <h4 className="font-semibold text-sm text-foreground">{comment.user?.name}</h4>
        <p className="text-muted-foreground text-sm mt-1.5 wrap-break-word leading-relaxed">
          {renderTextWithMentions(comment.text)}
        </p>

        <button
          onClick={() => handleLikeComment(comment._id)}
          className={`flex items-center gap-1.5 text-xs mt-3 transition font-medium ${likedComments.includes(comment._id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
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
            onClick={() => openEditDialog(comment._id, comment.text)}
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
              openEditDialog={openEditDialog}
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
  const [spaceAccessDialogOpen, setSpaceAccessDialogOpen] = useState(false);

  // Edit comment dialog state
  const [editCommentDialogOpen, setEditCommentDialogOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [text, setText] = useState("");
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [likedComments, setLikedComments] = useState<string[]>([]);

  // Image/Video slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

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
      const topicId = typeof post.topic === 'string' ? post.topic : post.topic?._id;
      await dispatch(deletePost({ id: post._id, topicId })).unwrap();
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

  const openEditDialog = (id: string, text: string) => {
    setEditingCommentId(id);
    setEditingCommentText(text);
    setEditCommentDialogOpen(true);
  };

  const handleSaveEditedComment = (newText: string) => {
    if (editingCommentId) {
      handleEditComment(editingCommentId, newText);
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
  const isOwner = currentUser?._id && post.author ? currentUser._id === post.author._id : false;
  const isAdmin = currentUser?.role === "admin";
  const canModify = isOwner || isAdmin;

  const getAttachmentIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (mimetype.startsWith("video/")) return <VideoIcon className="h-5 w-5" />;
    if (mimetype === "application/pdf") return <FileTextIcon className="h-5 w-5" />;
    return <FileIcon className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getBackendUrl = () => {
    return import.meta.env.VITE_API_URL || "http://localhost:3000";
  };

  const getFullUrl = (path: string) => {
    const baseUrl = getBackendUrl();
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  };

  // Filter media attachments (images and videos) for slider
  const mediaAttachments = post.attachments?.filter(
    (att) => att.mimetype.startsWith("image/") || att.mimetype.startsWith("video/")
  ) || [];

  // Filter non-media attachments (PDFs, etc.)
  const documentAttachments = post.attachments?.filter(
    (att) => !att.mimetype.startsWith("image/") && !att.mimetype.startsWith("video/")
  ) || [];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mediaAttachments.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mediaAttachments.length) % mediaAttachments.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handlePostClick = () => {
    if (post.topic && post.space) {
      // Check if user is a member of the space
      // Admin can access all spaces
      if (currentUser?.role === 'admin') {
        navigate(`/space/${post.space._id}/topic/${post.topic._id}/posts`);
      } else {
        // For non-admin users, check membership
        // We'll need to fetch space details to check membership
        checkSpaceAccessAndNavigate();
      }
    }
  };

  const checkSpaceAccessAndNavigate = async () => {
    try {
      // Fetch space details to check membership
      const response = await apiClient.get(`/api/spaces/${post.space?._id}`);
      const spaceData = response.data.data;

      // Check if current user is a member
      const isMember = spaceData.members?.includes(currentUser?._id);

      if (isMember) {
        // User is a member, navigate to the post
        navigate(`/space/${post.space?._id}/topic/${post.topic?._id}/posts`);
      } else {
        // User is not a member, show dialog
        setSpaceAccessDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to check space access:', error);
      // On error, show the dialog to be safe
      setSpaceAccessDialogOpen(true);
    }
  };

  const handleRequestJoin = () => {
    // Navigate to the space page where user can request to join
    if (post.space) {
      navigate(`/dashboard`);
      setSpaceAccessDialogOpen(false);
    }
  };

  return (
    <>
      <div
        id={`post-${post._id}`}
        onClick={handlePostClick}
        className="rounded-2xl p-6 border transition-all cursor-pointer"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (post.author?._id) {
                navigate(`/profile/${post.author._id}`);
              }
            }}
            className="shrink-0 rounded-full focus:outline-none"
            aria-label={`View ${post.author?.name || "user"}'s profile`}
            disabled={!post.author}
          >
            <Avatar name={post.author?.name || "Unknown User"} avatarUrl={post.author?.avatar} size="md" />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground mb-1">{post.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{post.author?.name || "Unknown User"}</span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded-full font-medium capitalize"
                style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                {post.author?.role || "user"}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setEditDialogOpen(true);
                }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ background: "var(--secondary)", color: "var(--primary)" }}
                title="Edit post"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialogOpen(true);
                }}
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
        <div className="text-foreground/80 leading-relaxed text-sm mb-4 whitespace-pre-wrap">
          {linkifyText(post.content)}
        </div>

        {/* MEDIA ATTACHMENTS - Instagram Style Slider */}
        {mediaAttachments.length > 0 && (
          <div className="mb-4 relative bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {/* Main Media Display */}
            <div className="relative w-full h-full">
              {mediaAttachments.map((attachment, index) => {
                const fullUrl = getFullUrl(attachment.path);
                const isImage = attachment.mimetype.startsWith("image/");
                const isVideo = attachment.mimetype.startsWith("video/");

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                  >
                    {isImage && (
                      <>
                        {!imageErrors.has(index) ? (
                          <img
                            src={fullUrl}
                            alt={attachment.originalName}
                            className="w-full h-full object-contain"
                            onError={() => {
                              console.error('Failed to load image:', fullUrl);
                              console.error('Attachment path:', attachment.path);
                              setImageErrors(prev => new Set(prev).add(index));
                            }}
                            onLoad={() => {
                              console.log('Image loaded successfully:', fullUrl);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-white">
                            <ImageIcon size={64} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">Failed to load image</p>
                            <p className="text-sm opacity-70 mt-2">{attachment.originalName}</p>
                            <p className="text-xs opacity-50 mt-1 font-mono">{fullUrl}</p>
                          </div>
                        )}
                      </>
                    )}

                    {isVideo && (
                      <video
                        controls
                        className="w-full h-full object-contain"
                        key={index === currentSlide ? 'active' : 'inactive'}
                      >
                        <source src={fullUrl} type={attachment.mimetype} />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows - Only show if more than 1 media */}
            {mediaAttachments.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Slide Indicators - Only show if more than 1 media */}
            {mediaAttachments.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {mediaAttachments.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Media Counter */}
            {mediaAttachments.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentSlide + 1} / {mediaAttachments.length}
              </div>
            )}
          </div>
        )}

        {/* DOCUMENT ATTACHMENTS (PDFs, etc.) */}
        {documentAttachments.length > 0 && (
          <div className="mb-4 space-y-2">
            {documentAttachments.map((attachment, index) => {
              const fullUrl = getFullUrl(attachment.path);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{ background: "var(--secondary)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getAttachmentIcon(attachment.mimetype)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={fullUrl}
                    download={attachment.originalName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 p-2 rounded-md transition-colors"
                    style={{ background: "var(--primary)", color: "white" }}
                    title="Download file"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
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
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
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
          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
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
                  openEditDialog={openEditDialog}
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

      <EditCommentDialog
        open={editCommentDialogOpen}
        onOpenChange={setEditCommentDialogOpen}
        commentText={editingCommentText}
        onSave={handleSaveEditedComment}
      />

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

      {/* Space Access Dialog */}
      <AlertDialog open={spaceAccessDialogOpen} onOpenChange={setSpaceAccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-50 rounded-full">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <AlertDialogTitle>Space Access Required</AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-base">
              You are not a member of <span className="font-semibold text-gray-900">{post.space?.title}</span>.
              <br /><br />
              To view this post and participate in discussions, you need to request to join this space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestJoin}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Spaces
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
