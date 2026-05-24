import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { likePost, deletePost } from "../../../store/Slice/postsSlice";
import type { Post } from "../types/post";
import { useNavigate } from "react-router";

import { Heart, MessageCircle, Calendar, Pencil, Trash2, Download, FileIcon, ImageIcon, VideoIcon, FileTextIcon, ChevronLeft, ChevronRight } from "lucide-react";

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

import { linkifyText, renderTextWithLinksAndMentions } from "../utils/linkify";

interface Props {
  post: Post;
}

/* Comment item */
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

  setReplyTexts: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string;
    }>
  >;

  submitReply: (id: string) => void;
}
const CommentItem = React.memo(
  ({
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
        {/* COMMENT CARD */}

        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
          {/* USER */}

          <h4 className="font-semibold text-sm text-gray-900">{comment.user?.name}</h4>

          {/* TEXT */}

          <p className="text-gray-700 text-sm mt-1.5 wrap-break-words leading-relaxed">
            {renderTextWithLinksAndMentions(comment.text)}
          </p>

          {/* LIKE */}

          <button
            onClick={() => handleLikeComment(comment._id)}
            className={`flex items-center gap-1.5 text-xs mt-3 transition font-medium ${likedComments.includes(comment._id)
              ? "text-red-600"
              : "text-gray-500 hover:text-red-600"
              }`}
          >
            <Heart
              size={13}
              className={
                likedComments.includes(comment._id) ? "fill-red-600" : ""
              }
            />

            {likedComments.includes(comment._id) ? "Liked" : "Like"}
          </button>

          {/* ACTIONS */}

          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 flex-wrap">
            <button
              onClick={() => handleDeleteComment(comment._id)}
              className="hover:text-red-600 font-medium"
            >
              Delete
            </button>

            <button
              onClick={() =>
                handleEditComment(
                  comment._id,
                  prompt("Edit comment", comment.text) || "",
                )
              }
              className="hover:text-blue-600 font-medium"
            >
              Edit
            </button>

            <button
              onClick={() => {
                setActiveReplyId(
                  activeReplyId === comment._id ? null : comment._id,
                );

                //auto mention username in reply input
                setReplyTexts((prev) => ({
                  ...prev,
                  [comment._id]: prev[comment._id]?.startsWith(
                    `@${comment.user?.name}`,
                  )
                    ? prev[comment._id]
                    : `@[${comment.user?.name || ""}] `,
                }));
              }}
              className="hover:text-blue-600 font-medium"
            >
              Reply
            </button>

            {comment.replies?.length > 0 && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="hover:text-blue-600 font-medium"
              >
                {expandedReplies.includes(comment._id)
                  ? "Hide"
                  : `${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>

          {/* REPLY INPUT */}

          {activeReplyId === comment._id && (
            <div className="flex gap-2 mt-3">
              <input
                value={replyTexts[comment._id] || ""}
                onChange={(e) =>
                  setReplyTexts((prev) => ({
                    ...prev,
                    [comment._id]: e.target.value,
                  }))
                }
                placeholder={`Reply to ${comment.user?.name}`}
                className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                onClick={() => submitReply(comment._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Reply
              </button>
            </div>
          )}
        </div>

        {/* nested replies */}

        {expandedReplies.includes(comment._id) &&
          comment.replies?.length > 0 && (
            <div className="ml-6 border-l-2 border-gray-200 pl-4 mt-3 space-y-3">
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
  },
);

/* Main component*/

export default function PostCard({ post }: Props) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [isLiking, setIsLiking] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [text, setText] = useState("");

  const [replyTexts, setReplyTexts] = useState<{
    [key: string]: string;
  }>({});

  const [comments, setComments] = useState<any[]>([]);

  const [showComments, setShowComments] = useState(false);

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);

  const [likedComments, setLikedComments] = useState<string[]>([]);

  // Image/Video slider state
  const [currentSlide, setCurrentSlide] = useState(0);

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

    comments.forEach((c) => {
      map.set(c._id, { ...c, replies: [] });
    });

    map.forEach((comment) => {
      const parentId =
        typeof comment.parentComment === "string"
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
  const nestedComments = Array.isArray(comments)
    ? buildCommentTree(comments)
    : [];

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

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
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

      setComments((prev) =>
        prev.filter((c) => c._id !== id && c.parentComment !== id),
      );
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

      setReplyTexts((prev) => ({
        ...prev,
        [parentId]: "",
      }));

      setActiveReplyId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleLikeComment = (id: string) => {
    setLikedComments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if current user has liked this post
  const isLikedByCurrentUser = currentUser?._id
    ? post.likes?.includes(currentUser._id)
    : false;

  const isOwner = currentUser?._id === post.author._id;
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

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition">
        {/* HEADER */}

        <div className="flex items-start gap-3 mb-4">
          <button
            onClick={() => navigate(`/profile/${post.author._id}`)}
            className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`View ${post.author.name}'s profile`}
          >
            <Avatar
              name={post.author.name}
              avatarUrl={post.author.avatar}
              size="md"
            />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{post.author.name}</span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {post.author.role}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>

          {canModify && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                title="Edit post"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                title="Delete post"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}

        <div className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
          {linkifyText(post.content)}
        </div>

        {/* MEDIA ATTACHMENTS - Instagram Style Slider */}
        {mediaAttachments.length > 0 && (
          <div className="mb-4 relative bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
            {/* Main Media Display */}
            <div className="relative w-full h-full">
              {mediaAttachments.map((attachment, index) => {
                const fullUrl = `${getBackendUrl()}${attachment.path}`;
                const isImage = attachment.mimetype.startsWith("image/");
                const isVideo = attachment.mimetype.startsWith("video/");

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                  >
                    {isImage && (
                      <img
                        src={fullUrl}
                        alt={attachment.originalName}
                        className="w-full h-full object-contain"
                      />
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
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextSlide}
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
                    onClick={() => goToSlide(index)}
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
              const fullUrl = `${getBackendUrl()}${attachment.path}`;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getAttachmentIcon(attachment.mimetype)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={fullUrl}
                    download={attachment.originalName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                    title="Download file"
                  >
                    <Download size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* ACTIONS */}

        <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
          <Button
            onClick={handleLike}
            disabled={isLiking}
            variant="ghost"
            className={`border rounded-md px-4 ${isLikedByCurrentUser
              ? "border-red-200 hover:bg-red-50"
              : "border-gray-200 hover:bg-gray-50"
              }`}
          >
            <Heart
              className={`mr-2 h-4 w-4 ${isLikedByCurrentUser
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
                }`}
            />

            <span
              className={
                isLikedByCurrentUser
                  ? "text-red-600 font-medium text-sm"
                  : "text-gray-700 text-sm"
              }
            >
              {post.likes?.length || 0}
            </span>
          </Button>

          <Button
            onClick={() => setShowComments(!showComments)}
            variant="ghost"
            className="border border-gray-200 hover:bg-gray-50 rounded-md px-4"
          >
            <MessageCircle className="mr-2 h-4 w-4 text-gray-700" />

            <span className="text-gray-700 font-medium text-sm">{comments.length}</span>
          </Button>
        </div>

        {/* COMMENTS */}

        {showComments && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            {/* ADD COMMENT */}

            <div className="flex gap-2 mb-5">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-300 px-4 py-2.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                onClick={handleAddComment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
              >
                Post
              </button>
            </div>

            {/* COMMENT LIST */}

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

      <EditPostDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        post={post}
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
