import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { likePost } from "../../../store/Slice/postsSlice";
import type { Post } from "../types/post";

import { Heart, MessageCircle, Calendar } from "lucide-react";

import { Button } from "../../core/components/ui/button";
import { Avatar } from "../../core/components/ui/avatar";

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
const renderTextWithMentions = (text: string) => {
  if (!text) return null;

  const parts = text.split(/(@\[[^\]]+\])/g);

  return parts.map((part, index) => {
    const isMention = /^@\[[^\]]+\]$/.test(part);

    return isMention ? (
      <span key={index} className="text-blue-600 font-medium">
        {part.replace(/@|\[|\]/g, "")}
      </span>
    ) : (
      <span key={index}>{part}</span>
    );
  });
};
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

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          {/* USER */}

          <h4 className="font-semibold text-gray-900">{comment.user?.name}</h4>

          {/* TEXT */}

          <p className="text-gray-700 mt-1 wrap-break-words">
            {renderTextWithMentions(comment.text)}
          </p>

          {/* LIKE */}

          <button
            onClick={() => handleLikeComment(comment._id)}
            className={`flex items-center gap-1 text-xs mt-3 transition ${
              likedComments.includes(comment._id)
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart
              size={14}
              className={
                likedComments.includes(comment._id) ? "fill-red-500" : ""
              }
            />

            {likedComments.includes(comment._id) ? "Liked" : "Like"}
          </button>

          {/* ACTIONS */}

          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 flex-wrap">
            <button
              onClick={() => handleDeleteComment(comment._id)}
              className="hover:text-red-500"
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
              className="hover:text-blue-500"
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
              className="hover:text-blue-500"
            >
              Reply
            </button>

            {comment.replies?.length > 0 && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="hover:text-blue-500"
              >
                {expandedReplies.includes(comment._id)
                  ? "Hide"
                  : `Replies (${comment.replies.length})`}
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
                placeholder={`Reply to @[${comment.user?.name}]`}
                className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={() => submitReply(comment._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
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

  const [isLiking, setIsLiking] = useState(false);

  const [text, setText] = useState("");

  const [replyTexts, setReplyTexts] = useState<{
    [key: string]: string;
  }>({});

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
      {/* HEADER */}

      <div className="flex items-start gap-3 mb-4">
        <Avatar
          name={post.author.name}
          avatarUrl={post.author.avatar}
          size="md"
        />

        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
            <span>{post.author.name}</span>

            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
              {post.author.role}
            </span>

            <span className="flex items-center gap-1">
              <Calendar size={14} />

              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="text-gray-700 mb-4">{post.content}</div>

      {/* ACTIONS */}

      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <Button
          onClick={handleLike}
          disabled={isLiking}
          variant="ghost"
          className="border border-gray-200 bg-white hover:bg-red-50 rounded-lg px-4"
        >
          <Heart
            className={`mr-2 h-5 w-5 ${
              post.likes?.length > 0
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            }`}
          />

          <span
            className={
              post.likes?.length > 0
                ? "text-red-500 font-medium"
                : "text-gray-700"
            }
          >
            {post.likes?.length || 0}
          </span>
        </Button>

        <Button
          onClick={() => setShowComments(!showComments)}
          variant="ghost"
          className="border border-gray-200 bg-white hover:bg-gray-100 rounded-lg px-4"
        >
          <MessageCircle className="mr-2 h-5 w-5 text-gray-700" />

          <span className="text-gray-700 font-medium">{comments.length}</span>
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
              placeholder="Write comment..."
              className="flex-1 border border-gray-300 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleAddComment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Comment
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
  );
}
